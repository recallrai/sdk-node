export class UserModel {
    public userId: string;
    public metadata: Record<string, any>;
    public createdAt: Date;
    public lastActiveAt: Date;

    constructor(data: {
        userId: string;
        metadata: Record<string, any>;
        createdAt: Date;
        lastActiveAt: Date;
    }) {
        this.userId = data.userId;
        this.metadata = data.metadata;
        this.createdAt = data.createdAt;
        this.lastActiveAt = data.lastActiveAt;
    }

    static fromApiResponse(data: any): UserModel {
        const userData = data.user || data;
        return new UserModel({
            userId: userData.user_id,
            metadata: userData.metadata || {},
            createdAt: new Date(userData.created_at),
            lastActiveAt: new Date(userData.last_active_at),
        });
    }
}

export class UserList {
    public users: UserModel[];
    public total: number;
    public hasMore: boolean;

    constructor(data: {
        users: UserModel[];
        total: number;
        hasMore: boolean;
    }) {
        this.users = data.users;
        this.total = data.total;
        this.hasMore = data.hasMore;
    }

    static fromApiResponse(data: any): UserList {
        return new UserList({
            users: data.users.map((user: any) => UserModel.fromApiResponse({ user })),
            total: data.total,
            hasMore: data.has_more,
        });
    }
}
