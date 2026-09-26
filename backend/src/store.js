export class InMemoryStore {
  constructor() {
    this.users = new Map();
    this.userProfiles = new Map();
    this.scans = [];
    this.communityPosts = [];
  }

  getUserById(userId) {
    const user = this.users.get(userId);
    return user?.is_active ? user : null;
  }

  getUserByEmail(email) {
    const normalized = email.toLowerCase();
    return [...this.users.values()].find((user) => user.email.toLowerCase() === normalized) ?? null;
  }

  saveUser(user) { this.users.set(user.id, user); return user; }
  getProfile(userId) { return this.userProfiles.get(userId) ?? null; }
  saveProfile(profile) { this.userProfiles.set(profile.user_id, profile); return profile; }
  saveScan(scan) { this.scans.push(scan); return scan; }

  getUserScans(userId) {
    return this.scans
      .filter((scan) => scan.user_id === userId)
      .sort((a, b) => b.scanned_at.localeCompare(a.scanned_at));
  }

  savePost(post) { this.communityPosts.push(post); return post; }
  getPostById(postId) { return this.communityPosts.find((post) => post.id === postId) ?? null; }

  getPosts(category = null) {
    return this.communityPosts
      .filter((post) => !category || post.category === category)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  clear() {
    this.users.clear();
    this.userProfiles.clear();
    this.scans.length = 0;
    this.communityPosts.length = 0;
  }
}

export const store = new InMemoryStore();
