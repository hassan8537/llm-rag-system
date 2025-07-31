interface BlacklistedToken {
  token: string;
  expiresAt: Date;
}

export class TokenBlacklistService {
  private static blacklistedTokens: Map<string, Date> = new Map();

  /**
   * Add token to blacklist
   */
  static addToBlacklist(token: string, expiresAt: Date): void {
    this.blacklistedTokens.set(token, expiresAt);
    
    // Clean up expired tokens periodically
    this.cleanupExpiredTokens();
  }

  /**
   * Check if token is blacklisted
   */
  static isBlacklisted(token: string): boolean {
    const expiresAt = this.blacklistedTokens.get(token);
    
    if (!expiresAt) {
      return false;
    }

    // If token has expired, remove it from blacklist
    if (new Date() > expiresAt) {
      this.blacklistedTokens.delete(token);
      return false;
    }

    return true;
  }

  /**
   * Remove expired tokens from blacklist
   */
  private static cleanupExpiredTokens(): void {
    const now = new Date();
    
    for (const [token, expiresAt] of this.blacklistedTokens.entries()) {
      if (now > expiresAt) {
        this.blacklistedTokens.delete(token);
      }
    }
  }

  /**
   * Get blacklist size (for monitoring)
   */
  static getBlacklistSize(): number {
    this.cleanupExpiredTokens();
    return this.blacklistedTokens.size;
  }

  /**
   * Clear all blacklisted tokens (for testing)
   */
  static clearBlacklist(): void {
    this.blacklistedTokens.clear();
  }
}
