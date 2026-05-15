import type {
	Booking,
	DailyReport,
	MenuItem,
	RestaurantSettings,
	RestaurantTable,
	User,
	CustomerAccount,
	BookingStatus,
	TableStatus,
} from '@/types';

// ---------- backendApi.ts contents ----------

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';
const AUTH_STORAGE_KEY = 'ukrestaurant-auth-session';
const PENDING_ORDER_STORAGE_KEY = 'ukrestaurant-pending-orders';

type BackendRole = 'admin' | 'employee' | 'customer';

export type BackendUser = {
	id: string;
	email: string;
	role: BackendRole;
	isBlocked?: boolean;
	firstName: string;
	lastName: string;
	phone?: string | null;
	createdAt?: string;
	updatedAt?: string;
};

export type BackendAuthSession = {
	token: string;
	user: BackendUser;
};

type RequestOptions = Omit<RequestInit, 'body'> & {
	auth?: boolean;
	body?: unknown;
};

type StoredPendingOrder = {
	id: string;
	customerEmail: string;
	totalAmount: number;
	status: 'pending' | 'paid' | 'cancelled';
	stripePaymentIntentId?: string;
	createdAt: string;
	updatedAt: string;
};

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readJson = <T,>(storageKey: string): T | null => {
	if (!isBrowser) {
		return null;
	}

	const raw = window.localStorage.getItem(storageKey);
	if (!raw) {
		return null;
	}

	try {
		return JSON.parse(raw) as T;
	} catch {
		return null;
	}
};

const writeJson = <T,>(storageKey: string, value: T | null): void => {
	if (!isBrowser) {
		return;
	}

	if (value === null) {
		window.localStorage.removeItem(storageKey);
		return;
	}

	window.localStorage.setItem(storageKey, JSON.stringify(value));
};

const formatValidationDetails = (payload: unknown): string | null => {
	if (!payload || typeof payload !== 'object') {
		return null;
	}

	const source = payload as {
		details?: {
			fieldErrors?: Record<string, string[] | undefined>;
			formErrors?: string[];
		};
		issues?: {
			fieldErrors?: Record<string, string[] | undefined>;
			formErrors?: string[];
		};
	};

	const details = source.details ?? source.issues;
	if (!details) {
		return null;
	}

	const fieldMessages = Object.values(details.fieldErrors ?? {})
		.flatMap((messages) => messages ?? [])
		.filter(Boolean);
	const formMessages = (details.formErrors ?? []).filter(Boolean);
	const combined = [...fieldMessages, ...formMessages];

	return combined.length ? combined.join(' ') : null;
};

export const getStoredAuthSession = (): BackendAuthSession | null => readJson<BackendAuthSession>(AUTH_STORAGE_KEY);

export const setStoredAuthSession = (session: BackendAuthSession | null): void => {
	writeJson(AUTH_STORAGE_KEY, session);
};

export const clearStoredAuthSession = (): void => {
	writeJson<BackendAuthSession>(AUTH_STORAGE_KEY, null);
};

export const getStoredAuthToken = (): string | null => getStoredAuthSession()?.token ?? null;

export const getStoredAuthUser = (): BackendUser | null => getStoredAuthSession()?.user ?? null;

export const persistPendingOrder = (order: StoredPendingOrder): void => {
	const existing = readJson<Record<string, StoredPendingOrder>>(PENDING_ORDER_STORAGE_KEY) ?? {};
	existing[order.id] = order;
	writeJson(PENDING_ORDER_STORAGE_KEY, existing);
};

export const consumePendingOrder = (orderId: string): StoredPendingOrder | null => {
	const existing = readJson<Record<string, StoredPendingOrder>>(PENDING_ORDER_STORAGE_KEY) ?? {};
	const order = existing[orderId] ?? null;

	if (order) {
		delete existing[orderId];
		writeJson(PENDING_ORDER_STORAGE_KEY, existing);
	}

	return order;
};

export const backendRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
	const headers = new Headers(options.headers);
	const token = options.auth === false ? null : getStoredAuthToken();

	if (token) {
		headers.set('Authorization', `Bearer ${token}`);
	}

	let body: BodyInit | null | undefined = options.body as BodyInit | null | undefined;
	if (body && !(body instanceof FormData) && !(body instanceof Blob)) {
		headers.set('Content-Type', 'application/json');
		body = JSON.stringify(body);
	}

	const response = await fetch(`${API_BASE_URL}${path}`, {
		...options,
		headers,
		body,
	});

	const contentType = response.headers.get('content-type') ?? '';
	const responseBody = response.status === 204
		? null
		: contentType.includes('application/json')
			? await response.json()
			: await response.text();

	if (!response.ok) {
		const validationDetails = formatValidationDetails(responseBody);
		const message = typeof responseBody === 'object' && responseBody && 'message' in responseBody
			? String((responseBody as { message?: unknown }).message ?? 'Request failed')
			: typeof responseBody === 'string' && responseBody
				? responseBody
				: 'Request failed';

		throw new Error(validationDetails ?? message);
	}

	return responseBody as T;
};

export const normalizeDateKey = (value: string | Date): string => {
	const text = value instanceof Date ? value.toISOString() : value;
	return text.slice(0, 10);
};

export const mapBackendBooking = (booking: {
	id: string;
	bookingCode: string;
	customerName: string;
	customerEmail: string;
	customerPhone: string;
	bookingDate: string;
	bookingTime: string;
	guests: number;
	tableId?: string | null;
	tableNumber?: number | null;
	status: Booking['status'];
	specialRequests?: string | null;
	depositAmount: number;
	paymentStatus: Booking['paymentStatus'];
	stripePaymentIntentId?: string | null;
	createdAt: string;
	updatedAt: string;
}): Booking => ({
	id: booking.id,
	bookingId: booking.bookingCode,
	customerName: booking.customerName,
	customerEmail: booking.customerEmail,
	customerPhone: booking.customerPhone,
	date: normalizeDateKey(booking.bookingDate),
	time: booking.bookingTime.slice(0, 5),
	guests: booking.guests,
	tableId: booking.tableId ?? undefined,
	tableNumber: booking.tableNumber ?? undefined,
	status: booking.status,
	specialRequests: booking.specialRequests ?? undefined,
	depositAmount: booking.depositAmount,
	paymentStatus: booking.paymentStatus,
	stripePaymentIntentId: booking.stripePaymentIntentId ?? undefined,
	createdAt: booking.createdAt,
	updatedAt: booking.updatedAt,
});

export const mapBackendTable = (table: {
	id: string;
	tableNumber: number;
	capacity: number;
	status: RestaurantTable['status'];
	timeSlot?: string | null;
	createdAt: string;
	updatedAt: string;
}): RestaurantTable => ({
	id: table.id,
	tableNumber: table.tableNumber,
	capacity: table.capacity,
	status: table.status,
	timeSlot: table.timeSlot ?? null,
	createdAt: table.createdAt,
	updatedAt: table.updatedAt,
});

export const mapBackendSettings = (settings: {
	id: string;
	name: string;
	address: string;
	phone: string;
	email: string;
	openingTime: string;
	closingTime: string;
	timeSlotInterval: number;
	defaultDepositAmount: number;
	cancellationDeadlineHours: number;
	autoReleaseMinutes: number;
}): RestaurantSettings => ({
	id: settings.id,
	name: settings.name,
	address: settings.address,
	phone: settings.phone,
	email: settings.email,
	openingTime: settings.openingTime,
	closingTime: settings.closingTime,
	timeSlotInterval: settings.timeSlotInterval,
	defaultDepositAmount: settings.defaultDepositAmount,
	cancellationDeadlineHours: settings.cancellationDeadlineHours,
	autoReleaseMinutes: settings.autoReleaseMinutes,
});

export const mapBackendMenuItem = (menuItem: {
	id: string;
	name: string;
	description: string;
	price: number;
	category: MenuItem['category'];
	imageUrl: string;
	rating: number;
	prepTime: number;
	isVeg: boolean;
	tags: string[];
	isActive: boolean;
	sortOrder: number;
	createdAt: string;
	updatedAt: string;
}): MenuItem => ({
	id: menuItem.id,
	name: menuItem.name,
	description: menuItem.description,
	price: menuItem.price,
	category: menuItem.category,
	image: menuItem.imageUrl,
	rating: menuItem.rating,
	prepTime: menuItem.prepTime,
	isVeg: menuItem.isVeg,
	tags: menuItem.tags ?? [],
	isActive: menuItem.isActive,
	sortOrder: menuItem.sortOrder,
	createdAt: menuItem.createdAt,
	updatedAt: menuItem.updatedAt,
});

export const mapBackendUser = (user: BackendUser): User => ({
	id: user.id,
	email: user.email,
	role: user.role === 'customer' ? 'customer' : user.role,
	isBlocked: user.isBlocked,
	firstName: user.firstName,
	lastName: user.lastName,
	phone: user.phone ?? undefined,
	createdAt: user.createdAt ?? new Date().toISOString(),
});

export const mapBackendReport = (report: DailyReport): DailyReport => report;

// ---------- adminApi.ts contents ----------

type AdminAuthResponse = {
	token: string;
	user: {
		id: string;
		email: string;
		role: 'admin' | 'employee' | 'customer';
		isBlocked?: boolean;
		firstName: string;
		lastName: string;
		phone?: string | null;
		createdAt?: string;
		updatedAt?: string;
	};
};

// Staff member API helpers

type PublicOperationalDataResponse = {
	settings: {
		id: string;
		name: string;
		address: string;
		phone: string;
		email: string;
		openingTime: string;
		closingTime: string;
		timeSlotInterval: number;
		defaultDepositAmount: number;
		cancellationDeadlineHours: number;
		autoReleaseMinutes: number;
	} | null;
	tables: Array<{
		id: string;
		tableNumber: number;
		capacity: number;
		status: TableStatus;
		timeSlot?: string | null;
		createdAt: string;
		updatedAt: string;
	}>;
	menuItems: Array<{
		id: string;
		name: string;
		description: string;
		price: number;
		category: MenuItem['category'];
		imageUrl: string;
		rating: number;
		prepTime: number;
		isVeg: boolean;
		tags: string[];
		isActive: boolean;
		sortOrder: number;
		createdAt: string;
		updatedAt: string;
	}>;
};

type CategoryItem = {
	id: string;
	name: string;
};

type BookingsResponse = {
	items: Array<{
		id: string;
		bookingCode: string;
		customerName: string;
		customerEmail: string;
		customerPhone: string;
		bookingDate: string;
		bookingTime: string;
		guests: number;
		tableId?: string | null;
		tableNumber?: number | null;
		status: Booking['status'];
		specialRequests?: string | null;
		depositAmount: number;
		paymentStatus: Booking['paymentStatus'];
		stripePaymentIntentId?: string | null;
		createdAt: string;
		updatedAt: string;
	}>;
};

const splitNameFromEmail = (email: string) => {
	const localPart = email.split('@')[0] ?? '';
	const normalized = localPart.replace(/[._-]+/g, ' ').trim();
	const parts = normalized.split(/\s+/).filter(Boolean);

	const firstName = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase() : 'Staff';
	const lastName = parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() + parts[parts.length - 1].slice(1).toLowerCase() : 'User';

	return { firstName, lastName };
};

const buildAppUser = (user: AdminAuthResponse['user']): User => {
	const mapped = mapBackendUser(user as unknown as BackendUser);

	return {
		id: mapped.id,
		email: mapped.email,
		role: mapped.role,
		isBlocked: mapped.isBlocked,
		firstName: mapped.firstName,
		lastName: mapped.lastName,
		phone: mapped.phone,
		createdAt: mapped.createdAt,
	};
};

const computeReports = (bookings: Booking[], tables: RestaurantTable[]): DailyReport[] => {
	const days = new Map<string, DailyReport>();

	for (const booking of bookings) {
		const day = booking.date.slice(0, 10);
		const current = days.get(day) ?? {
			date: day,
			totalBookings: 0,
			totalGuests: 0,
			totalRevenue: 0,
			noShows: 0,
			cancellations: 0,
			averageOccupancy: 0,
		};

		current.totalBookings += 1;
		current.totalGuests += booking.guests;
		current.totalRevenue += booking.depositAmount;

		if (booking.status === 'no_show') {
			current.noShows += 1;
		}

		if (booking.status === 'cancelled') {
			current.cancellations += 1;
		}

		days.set(day, current);
	}

	const tableCount = Math.max(1, tables.length);

	return [...days.values()]
		.sort((a, b) => a.date.localeCompare(b.date))
		.map((report) => ({
			...report,
			averageOccupancy: Math.min(100, Math.round((report.totalBookings / tableCount) * 100)),
		}));
};

export const signInStaffPortal = async (email: string, password: string): Promise<{ user?: User; error?: string }> => {
	try {
		const response = await backendRequest<AdminAuthResponse>('/auth/login', {
			method: 'POST',
			auth: false,
			body: { email: email.trim().toLowerCase(), password },
		});

		if (response.user.role === 'customer') {
			return { error: 'Customer accounts cannot access the staff portal.' };
		}

		setStoredAuthSession({ token: response.token, user: response.user as unknown as BackendUser });
		return { user: buildAppUser(response.user) };
	} catch (error) {
		return { error: error instanceof Error ? error.message : 'Invalid email or password.' };
	}
};

export const resolveCurrentStaffUser = async (): Promise<User | null> => {
	const session = getStoredAuthSession();

	if (!session || session.user.role === 'customer') {
		return null;
	}

	try {
		const response = await backendRequest<AdminAuthResponse>('/auth/me');

		if (response.user.role === 'customer') {
			return null;
		}

		return buildAppUser(response.user);
	} catch {
		const fallback = splitNameFromEmail(session.user.email);
		return {
			id: session.user.id,
			email: session.user.email,
			role: session.user.role === 'admin' ? 'admin' : 'employee',
			isBlocked: false,
			firstName: fallback.firstName,
			lastName: fallback.lastName,
			phone: session.user.phone ?? undefined,
			createdAt: session.user.createdAt ?? new Date().toISOString(),
		};
	}
};

export const signOutStaffPortal = async (): Promise<void> => {
	clearStoredAuthSession();
};

export const fetchPublicOperationalData = async (): Promise<{
	tables: RestaurantTable[];
	settings: RestaurantSettings | null;
	menuItems: MenuItem[];
}> => {
	const [settingsResponse, tablesResponse, menuItemsResponse] = await Promise.all([
		backendRequest<{ settings: PublicOperationalDataResponse['settings'] } | PublicOperationalDataResponse['settings']>('/restaurants/settings', { auth: false }),
		backendRequest<{ tables: PublicOperationalDataResponse['tables'] } | PublicOperationalDataResponse['tables']>('/restaurants/tables', { auth: false }),
		backendRequest<{ items: PublicOperationalDataResponse['menuItems'] }>('/menu?limit=1000&page=1&isActive=true', { auth: false }),
	]);

	const settings = Array.isArray(settingsResponse)
		? null
		: settingsResponse && typeof settingsResponse === 'object' && 'settings' in settingsResponse
			? settingsResponse.settings
			: settingsResponse;

	const tables = Array.isArray(tablesResponse)
		? tablesResponse
		: tablesResponse && typeof tablesResponse === 'object' && 'tables' in tablesResponse
			? tablesResponse.tables
			: [];

	return {
		tables: tables.map(mapBackendTable),
		settings: settings ? mapBackendSettings(settings) : null,
		menuItems: menuItemsResponse.items.map(mapBackendMenuItem),
	};
};

export const fetchMenuItems = async (): Promise<MenuItem[]> => {
	const response = await backendRequest<{ items: PublicOperationalDataResponse['menuItems'] }>('/menu?limit=1000&page=1', { auth: false });
	return response.items.map(mapBackendMenuItem);
};

export const fetchMenuCategories = async (): Promise<string[]> => {
	const response = await backendRequest<{ items: CategoryItem[] }>('/categories', { auth: false });
	return response.items.map((item) => item.name);
};

export const createMenuCategory = async (name: string): Promise<string> => {
	const response = await backendRequest<{ item: CategoryItem } | CategoryItem>('/categories', {
		method: 'POST',
		body: { name },
	});

	const normalized = response && typeof response === 'object' && 'item' in response
		? response.item
		: response;

	return normalized.name;
};

export const upsertMenuItem = async (menuItem: MenuItem, isNew: boolean = false): Promise<MenuItem> => {
	const response = !isNew && menuItem.id
		? await backendRequest<{ item: PublicOperationalDataResponse['menuItems'][number] } | PublicOperationalDataResponse['menuItems'][number]>(`/menu/${menuItem.id}`, {
				method: 'PUT',
				body: {
					name: menuItem.name,
					description: menuItem.description,
					price: menuItem.price,
					category: menuItem.category,
					imageUrl: menuItem.image,
					rating: menuItem.rating,
					prepTime: menuItem.prepTime,
					isVeg: menuItem.isVeg,
					tags: menuItem.tags,
					isActive: menuItem.isActive,
					sortOrder: menuItem.sortOrder,
				},
			})
		: await backendRequest<{ item: PublicOperationalDataResponse['menuItems'][number] } | PublicOperationalDataResponse['menuItems'][number]>('/menu', {
				method: 'POST',
				body: {
					id: menuItem.id,
					name: menuItem.name,
					description: menuItem.description,
					price: menuItem.price,
					category: menuItem.category,
					imageUrl: menuItem.image,
					rating: menuItem.rating,
					prepTime: menuItem.prepTime,
					isVeg: menuItem.isVeg,
					tags: menuItem.tags,
					isActive: menuItem.isActive,
					sortOrder: menuItem.sortOrder,
				},
			});

	const normalized = response && typeof response === 'object' && 'item' in response
		? response.item
		: response;

	return mapBackendMenuItem(normalized);
};

export const deleteMenuItem = async (menuItemId: string): Promise<void> => {
	await backendRequest<void>(`/menu/${menuItemId}`, { method: 'DELETE' });
};

export const uploadMenuImage = async (file: File): Promise<string> => {
	const formData = new FormData();
	formData.append('file', file);

	const asset = await backendRequest<{ asset: { url: string } }>('/upload', {
		method: 'POST',
		body: formData,
	});

	return asset.asset.url;
};

export const fetchStaffOperationalData = async (): Promise<{
	bookings: Booking[];
	reports: DailyReport[];
}> => {
	const [bookingsResponse, tablesResponse] = await Promise.all([
		backendRequest<BookingsResponse>('/bookings?limit=1000&page=1'),
		backendRequest<{ tables: PublicOperationalDataResponse['tables'] } | PublicOperationalDataResponse['tables']>('/restaurants/tables', { auth: false }),
	]);

	const bookings = bookingsResponse.items.map(mapBackendBooking);
	const normalizedTables = Array.isArray(tablesResponse)
		? tablesResponse
		: tablesResponse && typeof tablesResponse === 'object' && 'tables' in tablesResponse
			? tablesResponse.tables
			: [];
	const tables = normalizedTables.map(mapBackendTable);

	return {
		bookings,
		reports: computeReports(bookings, tables),
	};
};

export const updateBookingStatus = async (bookingId: string, status: BookingStatus): Promise<void> => {
	await backendRequest<void>(`/bookings/${bookingId}/status`, {
		method: 'PATCH',
		body: { status },
	});
};

export const updateTableStatus = async (tableId: string, status: TableStatus, timeSlot: string | null = null): Promise<void> => {
	await backendRequest<void>(`/restaurants/tables/${tableId}/status`, {
		method: 'PATCH',
		body: { status, timeSlot },
	});
};

export const createRestaurantTable = async (table: RestaurantTable): Promise<RestaurantTable> => {
	const response = await backendRequest<PublicOperationalDataResponse['tables'][number]>('/restaurants/tables', {
		method: 'POST',
		body: {
			id: table.id,
			tableNumber: table.tableNumber,
			capacity: table.capacity,
			status: table.status,
			timeSlot: table.timeSlot ?? null,
		},
	});

	return mapBackendTable(response);
};

export const fetchStaffMembers = async (): Promise<User[]> => {
	const response = await backendRequest<{ items?: BackendUser[] } | BackendUser[]>('/auth/staff');

	const items = Array.isArray(response)
		? response
		: response && typeof response === 'object' && 'items' in response
			? response.items ?? []
			: [];

	return items.map((u) => mapBackendUser(u as BackendUser));
};

export const createStaffMember = async (payload: { email: string; password: string; firstName: string; lastName: string; phone?: string }): Promise<User> => {
	const response = await backendRequest<AdminAuthResponse>('/auth/staff', {
		method: 'POST',
		body: payload,
	});

	return mapBackendUser(response.user as unknown as BackendUser);
};

export const updateStaffMember = async (payload: { id: string; email?: string; password?: string; firstName?: string; lastName?: string; phone?: string | null }): Promise<User> => {
	const { id, ...body } = payload;
	const response = await backendRequest<BackendUser>(`/auth/staff/${id}`, {
		method: 'PATCH',
		body,
	});

	return mapBackendUser(response as BackendUser);
};

export const deleteStaffMember = async (staffId: string): Promise<void> => {
	await backendRequest<void>(`/auth/staff/${staffId}`, { method: 'DELETE' });
};

export const updateRestaurantSettings = async (payload: {
	id: string;
	name: string;
	address: string;
	phone: string;
	email: string;
	openingTime: string;
	closingTime: string;
	timeSlotInterval: number;
	defaultDepositAmount: number;
	cancellationDeadlineHours: number;
	autoReleaseMinutes: number;
}): Promise<RestaurantSettings> => {
	const response = await backendRequest<
		PublicOperationalDataResponse['settings'] | { settings: PublicOperationalDataResponse['settings'] } | null
	>('/restaurants/settings', {
		method: 'PUT',
		body: payload,
	});

	const settings = response && typeof response === 'object' && 'settings' in response
		? response.settings
		: response;

	if (!settings) {
		throw new Error('Unable to update restaurant settings.');
	}

	return mapBackendSettings(settings);
};

// ---------- backendBookingApi.ts contents ----------

type BookingResponse = {
	booking?: {
		id: string;
		bookingCode: string;
		customerName: string;
		customerEmail: string;
		customerPhone: string;
		bookingDate: string;
		bookingTime: string;
		guests: number;
		tableId?: string | null;
		tableNumber?: number | null;
		status: Booking['status'];
		specialRequests?: string | null;
		depositAmount: number;
		paymentStatus: Booking['paymentStatus'];
		stripePaymentIntentId?: string | null;
		createdAt: string;
		updatedAt: string;
	};
};

type AvailabilityResponse = {
	slots: Array<{ time: string; available: boolean; availableTables: number }>;
};

type OccupiedTablesResponse = {
	tableIds: string[];
};

type AvailableTablesResponse = {
	tables: Array<{
		id: string;
		tableNumber: number;
		capacity: number;
		status: string;
		timeSlot?: string | null;
		createdAt: string;
		updatedAt: string;
	}>;
};

type CustomerBookingsResponse = {
	items: Array<{
		id: string;
		bookingCode: string;
		customerName: string;
		customerEmail: string;
		customerPhone: string;
		bookingDate: string;
		bookingTime: string;
		guests: number;
		tableId?: string | null;
		tableNumber?: number | null;
		status: Booking['status'];
		specialRequests?: string | null;
		depositAmount: number;
		paymentStatus: Booking['paymentStatus'];
		stripePaymentIntentId?: string | null;
		createdAt: string;
		updatedAt: string;
	}>;
};

type PendingOnlineOrder = {
	id: string;
	customerEmail: string;
	totalAmount: number;
	status: 'pending' | 'paid' | 'cancelled';
	stripePaymentIntentId?: string;
	createdAt: string;
	updatedAt: string;
};

const mapBooking = (
	booking: NonNullable<BookingResponse['booking'] | CustomerBookingsResponse['items'][number]>,
): Booking => {
	if (!booking) {
		throw new Error('Invalid booking payload.');
	}

	return mapBackendBooking(booking);
};

export interface SaveResult {
	ok: boolean;
	error?: string;
}

export interface SlotResult {
	time: string;
	available: boolean;
	availableTables: number;
}

export interface OccupiedTableResult {
	tableIds: string[];
}

export const saveBooking = async (booking: Booking): Promise<SaveResult> => {
	try {
		const payload = {
			id: booking.id,
			bookingId: booking.bookingId,
			customerName: booking.customerName,
			customerEmail: booking.customerEmail,
			customerPhone: booking.customerPhone,
			bookingDate: booking.date,
			bookingTime: booking.time,
			guests: booking.guests,
			status: booking.status,
			depositAmount: booking.depositAmount,
			paymentStatus: booking.paymentStatus,
			createdAt: booking.createdAt,
			updatedAt: booking.updatedAt,
			...(booking.tableId ? { tableId: booking.tableId } : {}),
			...(booking.tableNumber ? { tableNumber: booking.tableNumber } : {}),
			...(booking.specialRequests ? { specialRequests: booking.specialRequests } : {}),
			...(booking.stripePaymentIntentId ? { stripePaymentIntentId: booking.stripePaymentIntentId } : {}),
		};

		const response = await backendRequest<BookingResponse>('/bookings', {
			method: 'POST',
			auth: false,
			body: payload,
		});

		if (!response.booking) {
			return { ok: false, error: 'Unable to save booking.' };
		}

		return { ok: true };
	} catch (error) {
		return { ok: false, error: error instanceof Error ? error.message : 'Unable to save booking.' };
	}
};

export const getAvailableSlots = async (
	date: string,
	guests: number
): Promise<{ ok: boolean; slots: SlotResult[]; error?: string }> => {
	try {
		const response = await backendRequest<AvailabilityResponse>(`/bookings/availability?date=${encodeURIComponent(date)}&guests=${encodeURIComponent(String(guests))}`, {
			auth: false,
		});

		return { ok: true, slots: response.slots };
	} catch (error) {
		return { ok: false, slots: [], error: error instanceof Error ? error.message : 'Unable to fetch available slots.' };
	}
};

export const getOccupiedTableIds = async (
	date: string,
	time: string
): Promise<{ ok: boolean; tableIds: string[]; error?: string }> => {
	try {
		const response = await backendRequest<OccupiedTablesResponse>(`/bookings/occupied-tables?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`, {
			auth: false,
		});

		return { ok: true, tableIds: response.tableIds };
	} catch (error) {
		return { ok: false, tableIds: [], error: error instanceof Error ? error.message : 'Unable to fetch occupied tables.' };
	}
};

export const getAvailableTables = async (
	date: string,
	time: string,
	guests: number
): Promise<{ ok: boolean; tables: AvailableTablesResponse['tables']; error?: string }> => {
	try {
		const response = await backendRequest<AvailableTablesResponse>(
			`/bookings/available-tables?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}&guests=${encodeURIComponent(String(guests))}`,
			{ auth: false }
		);

		return { ok: true, tables: response.tables };
	} catch (error) {
		return { ok: false, tables: [], error: error instanceof Error ? error.message : 'Unable to fetch available tables.' };
	}
};

export const getCustomerBookings = async (
	customerEmail: string
): Promise<{ ok: boolean; bookings: Booking[]; error?: string }> => {
	try {
		const response = await backendRequest<CustomerBookingsResponse>(`/bookings?email=${encodeURIComponent(customerEmail)}`);
		return { ok: true, bookings: response.items.map(mapBooking) };
	} catch (error) {
		return { ok: false, bookings: [], error: error instanceof Error ? error.message : 'Unable to fetch bookings.' };
	}
};

export interface OrderItem {
	id: string;
	menuItemId: string;
	quantity: number;
	unitPrice: number;
}

export const saveOrderItems = async (
	orderId: string,
	items: OrderItem[]
): Promise<SaveResult> => {
	if (items.length === 0) {
		return { ok: false, error: 'No items to save.' };
	}

	const pendingOrder = consumePendingOrder(orderId) as PendingOnlineOrder | null;

	if (!pendingOrder) {
		return { ok: false, error: 'Pending order not found.' };
	}

	try {
		await backendRequest('/orders', {
			method: 'POST',
			auth: false,
			body: {
				id: pendingOrder.id,
				customerEmail: pendingOrder.customerEmail,
				totalAmount: pendingOrder.totalAmount,
				status: pendingOrder.status,
				stripePaymentIntentId: pendingOrder.stripePaymentIntentId ?? null,
				createdAt: pendingOrder.createdAt,
				updatedAt: pendingOrder.updatedAt,
				items: items.map((item) => ({
					menuItemId: item.menuItemId,
					quantity: item.quantity,
					unitPrice: item.unitPrice,
				})),
			},
		});

		return { ok: true };
	} catch (error) {
		return { ok: false, error: error instanceof Error ? error.message : 'Unable to save order items.' };
	}
};

export interface OnlineOrder {
	id: string;
	customerEmail: string;
	totalAmount: number;
	status: 'pending' | 'paid' | 'cancelled';
	stripePaymentIntentId?: string;
	createdAt: string;
	updatedAt: string;
}

export const saveOnlineOrder = async (order: OnlineOrder): Promise<SaveResult> => {
	persistPendingOrder(order as unknown as StoredPendingOrder);
	return { ok: true };
};

export interface OrderOnlineWithItems extends OnlineOrder {
	items?: Array<{
		id: string;
		menuItemId: string;
		quantity: number;
		unitPrice: number;
		totalPrice: number;
	}>;
}

export const getCustomerOrders = async (
	customerEmail: string
): Promise<{ ok: boolean; orders: OrderOnlineWithItems[]; error?: string }> => {
	try {
		const response = await backendRequest<{ items: Array<{
			id: string;
			orderNumber: string;
			customerName?: string | null;
			customerEmail: string;
			customerPhone?: string | null;
			totalAmount: number;
			status: OnlineOrder['status'];
			stripePaymentIntentId?: string | null;
			createdAt: string;
			updatedAt: string;
			items: Array<{
				id: string;
				orderId: string;
				menuItemId: string;
				quantity: number;
				unitPrice: number;
				totalPrice: number;
			}>;
		}> }>(`/orders?email=${encodeURIComponent(customerEmail)}`);

		return {
			ok: true,
			orders: response.items.map((order) => ({
				id: order.id,
				customerEmail: order.customerEmail,
				totalAmount: order.totalAmount,
				status: order.status,
				stripePaymentIntentId: order.stripePaymentIntentId ?? undefined,
				createdAt: order.createdAt,
				updatedAt: order.updatedAt,
				items: order.items.map((item) => ({
					id: item.id,
					menuItemId: item.menuItemId,
					quantity: item.quantity,
					unitPrice: item.unitPrice,
					totalPrice: item.totalPrice,
				})),
			})),
		};
	} catch (error) {
		return { ok: false, orders: [], error: error instanceof Error ? error.message : 'Unable to fetch orders.' };
	}
};

// ---------- bookingEmailApi.ts contents ----------

export interface BookingEmailResult {
	ok: boolean;
	error?: string;
}

export const sendBookingConfirmationEmail = async (booking: Booking): Promise<BookingEmailResult> => {
	try {
		await backendRequest('/notifications/booking-confirmation', {
			method: 'POST',
			auth: false,
			body: { booking },
		});

		return { ok: true };
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : 'Unable to connect to email service.',
		};
	}
};

// ---------- customerApi.ts contents ----------

type CustomerAuthResponse = {
	token: string;
	user: {
		id: string;
		email: string;
		role: 'admin' | 'employee' | 'customer';
		firstName: string;
		lastName: string;
		phone?: string | null;
		createdAt?: string;
		updatedAt?: string;
	};
};

const toCustomerAccount = (user: CustomerAuthResponse['user']): CustomerAccount => {
	const mapped = mapBackendUser(user as unknown as BackendUser);

	return {
		id: mapped.id,
		email: mapped.email,
		firstName: mapped.firstName,
		lastName: mapped.lastName,
		phone: mapped.phone ?? '',
		createdAt: mapped.createdAt,
	};
};

export const signUpCustomer = async (payload: {
	firstName: string;
	lastName: string;
	phone: string;
	email: string;
	password: string;
}): Promise<{ customer?: CustomerAccount; error?: string }> => {
	try {
		const response = await backendRequest<CustomerAuthResponse>('/auth/register', {
			method: 'POST',
			auth: false,
			body: {
				firstName: payload.firstName.trim(),
				lastName: payload.lastName.trim(),
				phone: payload.phone.trim(),
				email: payload.email.trim().toLowerCase(),
				password: payload.password,
			},
		});

		setStoredAuthSession({ token: response.token, user: response.user as unknown as BackendUser });
		return { customer: toCustomerAccount(response.user) };
	} catch (error) {
		return { error: error instanceof Error ? error.message : 'Unable to create account right now. Please try again.' };
	}
};

export const signInCustomer = async (
	emailInput: string,
	password: string
): Promise<{ customer?: CustomerAccount; error?: string }> => {
	try {
		const response = await backendRequest<CustomerAuthResponse>('/auth/login', {
			method: 'POST',
			auth: false,
			body: {
				email: emailInput.trim().toLowerCase(),
				password,
			},
		});

		if (response.user.role !== 'customer') {
			return { error: 'This account is not a customer account.' };
		}

		setStoredAuthSession({ token: response.token, user: response.user as unknown as BackendUser });
		return { customer: toCustomerAccount(response.user) };
	} catch (error) {
		return { error: error instanceof Error ? error.message : 'Invalid email or password.' };
	}
};

export const resolveCurrentCustomer = async (): Promise<CustomerAccount | null> => {
	const session = getStoredAuthSession();

	if (!session) {
		return null;
	}

	try {
		const response = await backendRequest<CustomerAuthResponse>('/auth/me');

		if (response.user.role !== 'customer') {
			return null;
		}

		return toCustomerAccount(response.user);
	} catch {
		return session.user.role === 'customer' ? toCustomerAccount(session.user as unknown as CustomerAuthResponse['user']) : null;
	}
};

export const signOutCustomer = async (): Promise<void> => {
	clearStoredAuthSession();
};

