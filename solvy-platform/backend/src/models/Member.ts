export interface Member {
  id: string
  clerkId: string  // Clerk user ID
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  businessName?: string
  businessType?: 'personal' | 'business'
  kycStatus: 'pending' | 'approved' | 'rejected' | 'needs_review'
  stripeCustomerId?: string
  cardStatus?: 'pending' | 'issued' | 'active' | 'suspended'
  createdAt: Date
  updatedAt: Date
}

export interface CreateMemberInput {
  clerkId: string
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  businessName?: string
  businessType?: 'personal' | 'business'
}

export interface UpdateMemberInput {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  businessName?: string
  kycStatus?: Member['kycStatus']
  stripeCustomerId?: string
  cardStatus?: Member['cardStatus']
}

// In-memory storage for MVP (replace with real database later)
class MemberStore {
  private members: Map<string, Member> = new Map()

  async create(input: CreateMemberInput): Promise<Member> {
    const member: Member = {
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...input,
      kycStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.members.set(member.id, member)
    return member
  }

  async findById(id: string): Promise<Member | null> {
    return this.members.get(id) || null
  }

  async findByClerkId(clerkId: string): Promise<Member | null> {
    for (const member of this.members.values()) {
      if (member.clerkId === clerkId) {
        return member
      }
    }
    return null
  }

  async findByEmail(email: string): Promise<Member | null> {
    for (const member of this.members.values()) {
      if (member.email === email) {
        return member
      }
    }
    return null
  }

  async update(id: string, updates: UpdateMemberInput): Promise<Member | null> {
    const member = this.members.get(id)
    if (!member) return null

    const updatedMember = {
      ...member,
      ...updates,
      updatedAt: new Date()
    }

    this.members.set(id, updatedMember)
    return updatedMember
  }

  async list(): Promise<Member[]> {
    return Array.from(this.members.values())
  }

  async delete(id: string): Promise<boolean> {
    return this.members.delete(id)
  }
}

export const memberStore = new MemberStore()
