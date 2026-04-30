"""
Community API — /api/community/*
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel
from typing import Optional, List

from app.database import get_db
from app.models.user import User
from app.models.community import CommunityPost
from app.api.auth import get_current_user

router = APIRouter(prefix="/api/community", tags=["community"])

VALID_CATEGORIES = ["general", "recipe", "symptom"]


class PostCreate(BaseModel):
    category: str = "general"
    title: str
    body: str
    tags: Optional[List[str]] = []
    product_barcode: Optional[str] = None


class VoteRequest(BaseModel):
    direction: str  # "up" | "down"


@router.get("/posts")
async def list_posts(
    category: Optional[str] = Query(None),
    page: int = 1,
    per_page: int = 15,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = select(CommunityPost).order_by(desc(CommunityPost.created_at))
    if category and category in VALID_CATEGORIES:
        q = q.where(CommunityPost.category == category)
    q = q.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(q)
    posts = result.scalars().all()
    return {
        "posts": [
            {
                "id": p.id,
                "author": p.author_name or "Anonymous",
                "category": p.category,
                "title": p.title,
                "body": p.body[:200] + ("..." if len(p.body) > 200 else ""),
                "tags": p.tags,
                "upvotes": p.upvotes,
                "downvotes": p.downvotes,
                "net_votes": p.upvotes - p.downvotes,
                "product_barcode": p.product_barcode,
                "created_at": p.created_at.isoformat(),
            }
            for p in posts
        ]
    }


@router.post("/posts", status_code=201)
async def create_post(
    body: PostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.category not in VALID_CATEGORIES:
        raise HTTPException(status_code=422, detail=f"category must be one of {VALID_CATEGORIES}")
    if len(body.title) < 5:
        raise HTTPException(status_code=422, detail="Title too short")

    post = CommunityPost(
        user_id=current_user.id,
        author_name=current_user.full_name or current_user.email.split("@")[0],
        category=body.category,
        title=body.title,
        body=body.body,
        tags=body.tags,
        product_barcode=body.product_barcode,
    )
    db.add(post)
    await db.flush()
    return {"id": post.id, "message": "Post created"}


@router.post("/posts/{post_id}/vote")
async def vote_post(
    post_id: str,
    body: VoteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(CommunityPost).where(CommunityPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if body.direction == "up":
        post.upvotes += 1
    elif body.direction == "down":
        post.downvotes += 1
    else:
        raise HTTPException(status_code=422, detail="direction must be 'up' or 'down'")
    await db.flush()
    return {"upvotes": post.upvotes, "downvotes": post.downvotes}


@router.get("/recipes")
async def list_recipes(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(CommunityPost)
        .where(CommunityPost.category == "recipe")
        .order_by(desc(CommunityPost.upvotes))
        .limit(20)
    )
    return {"posts": [{"id": p.id, "title": p.title, "upvotes": p.upvotes} for p in result.scalars().all()]}


@router.get("/symptoms")
async def list_symptom_threads(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(CommunityPost)
        .where(CommunityPost.category == "symptom")
        .order_by(desc(CommunityPost.created_at))
        .limit(20)
    )
    return {"posts": [{"id": p.id, "title": p.title, "created_at": p.created_at.isoformat()} for p in result.scalars().all()]}
