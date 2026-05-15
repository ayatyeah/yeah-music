import { mockApi } from './mockApi';

const USERS_KEY = 'yeahmusic-users';

const loadUsers = () => {
	const raw = localStorage.getItem(USERS_KEY);
	return raw ? JSON.parse(raw) : [];
};

const saveUsers = (users) => {
	try {
		localStorage.setItem(USERS_KEY, JSON.stringify(users));
	} catch (error) {
		const isQuotaError =
			error?.name === 'QuotaExceededError' ||
			error?.name === 'NS_ERROR_DOM_QUOTA_REACHED';
		if (isQuotaError) {
			throw new Error('Storage quota exceeded. Please use a smaller avatar image.');
		}
		throw error;
	}
};

const sanitizeUser = (user) => {
	const { password, ...safe } = user;
	return safe;
};

const seedUsers = () => {
	const existing = loadUsers();
	if (existing.length > 0) return existing;

	const demo = [
		{
			id: 'u_demo_listener',
			username: 'ListenerDemo',
			email: 'listener@yeahmusic.dev',
			password: 'password123',
			role: 'listener',
			verified: true,
			avatar: '',
		},
		{
			id: 'u_demo_artist',
			username: 'ArtistDemo',
			email: 'artist@yeahmusic.dev',
			password: 'password123',
			role: 'artist',
			verified: true,
			avatar: '',
		},
	];
	saveUsers(demo);
	return demo;
};

export const authService = {
	async register(payload) {
		const users = seedUsers();
		if (users.some((user) => user.email === payload.email)) {
			throw new Error('Email already registered');
		}

		const newUser = {
			id: `u_${Date.now()}`,
			username: payload.username,
			email: payload.email,
			password: payload.password,
			role: payload.role,
			verified: true,
			avatar: payload.avatar || '',
		};

		saveUsers([newUser, ...users]);

		const response = await mockApi.execute(
			{
				user: sanitizeUser(newUser),
				token: `mock_jwt_${Date.now()}`,
			},
			{ failureRate: 0, latencyMin: 600, latencyMax: 1400 }
		);

		return response.data;
	},

	async login(credentials) {
		const users = seedUsers();
		const user = users.find(
			(entry) => entry.email === credentials.email && entry.password === credentials.password
		);
		if (!user) {
			throw new Error('Invalid email or password');
		}

		const response = await mockApi.execute(
			{
				user: sanitizeUser(user),
				token: `mock_jwt_${Date.now()}`,
			},
			{ failureRate: 0, latencyMin: 500, latencyMax: 1200 }
		);

		return response.data;
	},
};
