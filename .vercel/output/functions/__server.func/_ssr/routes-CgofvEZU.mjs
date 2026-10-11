import { i as __toESM } from "../_runtime.mjs";
import { a as Overlay2, b as require_jsx_runtime, c as Title2, d as DialogContent$1, f as DialogDescription$1, h as DialogTitle$1, i as Description2, l as Dialog$1, m as DialogPortal$1, n as Cancel, o as Portal2, p as DialogOverlay$1, r as Content2, s as Root2, t as Action, u as DialogClose, v as Slot, x as require_react } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { _ as BookOpen, a as ShoppingBag, c as Plus, d as Ellipsis, f as Coffee, g as Bus, h as ChevronLeft, l as House, m as ChevronRight, n as Wallet, o as Settings2, p as Clapperboard, r as UtensilsCrossed, s as Receipt, t as X, u as HeartPulse } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as isToday, i as subDays, n as parseISO, o as format, r as isYesterday, s as startOfDay, t as id } from "../_libs/date-fns.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
import { t as Drawer } from "../_libs/vaul.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CgofvEZU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CATEGORIES = [
	{
		id: "makanan",
		label: "Makanan",
		icon: UtensilsCrossed
	},
	{
		id: "minuman",
		label: "Minuman",
		icon: Coffee
	},
	{
		id: "transport",
		label: "Transport",
		icon: Bus
	},
	{
		id: "belanja",
		label: "Belanja",
		icon: ShoppingBag
	},
	{
		id: "tagihan",
		label: "Tagihan",
		icon: Receipt
	},
	{
		id: "hiburan",
		label: "Hiburan",
		icon: Clapperboard
	},
	{
		id: "kesehatan",
		label: "Kesehatan",
		icon: HeartPulse
	},
	{
		id: "pendidikan",
		label: "Pendidikan",
		icon: BookOpen
	},
	{
		id: "rumah",
		label: "Rumah",
		icon: House
	},
	{
		id: "lainnya",
		label: "Lainnya",
		icon: Ellipsis
	}
];
var CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
function formatRupiah(amount) {
	return `Rp ${formatRupiahPlain(amount)}`;
}
function formatRupiahPlain(amount) {
	return new Intl.NumberFormat("id-ID", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(amount);
}
function formatCompactId(amount) {
	const abs = Math.abs(amount);
	if (abs >= 1e9) return `Rp ${(amount / 1e9).toLocaleString("id-ID", { maximumFractionDigits: 1 })} M`;
	if (abs >= 1e6) return `Rp ${(amount / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
	if (abs >= 1e3) return `Rp ${(amount / 1e3).toLocaleString("id-ID", { maximumFractionDigits: 0 })} rb`;
	return formatRupiah(amount);
}
function isoDate(d) {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function daysAgoIso(n) {
	const d = /* @__PURE__ */ new Date();
	d.setHours(12, 0, 0, 0);
	d.setDate(d.getDate() - n);
	return isoDate(d);
}
function formatDayHeading(iso) {
	const d = parseISO(iso);
	if (isToday(d)) return "Hari ini";
	if (isYesterday(d)) return "Kemarin";
	return format(d, "EEEE, d MMMM", { locale: id });
}
function formatMonthTitle(year, monthIndex) {
	const d = new Date(year, monthIndex, 1);
	return format(d, "LLLL yyyy", { locale: id });
}
function monthPrefix(year, monthIndex) {
	return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}
function daysInMonth(year, monthIndex) {
	return new Date(year, monthIndex + 1, 0).getDate();
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var SEED = [
	{
		amount: 38e3,
		category: "makanan",
		note: "Nasi Padang Roda",
		daysAgo: 0
	},
	{
		amount: 22e3,
		category: "minuman",
		note: "Kopi Janji Jiwa",
		daysAgo: 0
	},
	{
		amount: 24e3,
		category: "transport",
		note: "Gojek ke kantor",
		daysAgo: 0
	},
	{
		amount: 18e3,
		category: "makanan",
		note: "Warteg makan siang",
		daysAgo: 1
	},
	{
		amount: 15e4,
		category: "transport",
		note: "Isi bensin Pertamina",
		daysAgo: 1
	},
	{
		amount: 67500,
		category: "belanja",
		note: "Indomaret mingguan",
		daysAgo: 2
	},
	{
		amount: 2e5,
		category: "tagihan",
		note: "Token listrik",
		daysAgo: 3
	},
	{
		amount: 55e3,
		category: "hiburan",
		note: "Tiket bioskop XXI",
		daysAgo: 3
	},
	{
		amount: 48e3,
		category: "kesehatan",
		note: "Apotek K-24",
		daysAgo: 4
	},
	{
		amount: 72e3,
		category: "makanan",
		note: "GrabFood malam",
		daysAgo: 4
	},
	{
		amount: 5e4,
		category: "tagihan",
		note: "Pulsa Telkomsel",
		daysAgo: 5
	},
	{
		amount: 189e3,
		category: "belanja",
		note: "Shopee kebutuhan rumah",
		daysAgo: 6
	},
	{
		amount: 28e3,
		category: "minuman",
		note: "Kopi Tuku",
		daysAgo: 6
	},
	{
		amount: 35e3,
		category: "rumah",
		note: "Laundry kiloan",
		daysAgo: 7
	},
	{
		amount: 145e3,
		category: "makanan",
		note: "Makan malam sushi",
		daysAgo: 8
	},
	{
		amount: 7e3,
		category: "transport",
		note: "TransJakarta",
		daysAgo: 8
	},
	{
		amount: 79e3,
		category: "hiburan",
		note: "Spotify Family",
		daysAgo: 10
	},
	{
		amount: 32e3,
		category: "kesehatan",
		note: "Vitamin C",
		daysAgo: 11
	},
	{
		amount: 98e3,
		category: "pendidikan",
		note: "Buku Gramedia",
		daysAgo: 12
	},
	{
		amount: 85e3,
		category: "tagihan",
		note: "Tagihan PDAM",
		daysAgo: 14
	},
	{
		amount: 25e3,
		category: "makanan",
		note: "Ayam Geprek Bensu",
		daysAgo: 14
	},
	{
		amount: 1e4,
		category: "transport",
		note: "Parkir mall",
		daysAgo: 15
	},
	{
		amount: 245e3,
		category: "rumah",
		note: "Perlengkapan IKEA",
		daysAgo: 16
	},
	{
		amount: 18e3,
		category: "minuman",
		note: "Es kopi susu",
		daysAgo: 17
	},
	{
		amount: 32e4,
		category: "belanja",
		note: "Baju diskon",
		daysAgo: 18
	}
];
function buildDemoExpenses() {
	const now = Date.now();
	return SEED.map((row, i) => ({
		id: `demo-${i + 1}`,
		amount: row.amount,
		category: row.category,
		note: row.note,
		date: daysAgoIso(row.daysAgo),
		createdAt: now - i * 36e3
	}));
}
var useExpenseStore = create()(persist((set, get) => ({
	expenses: buildDemoExpenses(),
	monthlyBudget: 4e6,
	hasSeeded: true,
	addExpense: (draft) => {
		set({ expenses: [{
			id: crypto.randomUUID(),
			amount: draft.amount,
			category: draft.category,
			note: draft.note.trim(),
			date: draft.date,
			createdAt: Date.now()
		}, ...get().expenses] });
	},
	updateExpense: (id, draft) => {
		set({ expenses: get().expenses.map((item) => item.id === id ? {
			...item,
			amount: draft.amount,
			category: draft.category,
			note: draft.note.trim(),
			date: draft.date
		} : item) });
	},
	deleteExpense: (id) => {
		set({ expenses: get().expenses.filter((item) => item.id !== id) });
	},
	setBudget: (amount) => {
		set({ monthlyBudget: Math.max(0, Math.round(amount)) });
	},
	seedIfEmpty: () => {
		if (get().hasSeeded) return;
		set({
			expenses: buildDemoExpenses(),
			hasSeeded: true
		});
	},
	clearAll: () => {
		set({
			expenses: [],
			hasSeeded: true
		});
	}
}), {
	name: "keluar-ledger-v1",
	skipHydration: true,
	partialize: (state) => ({
		expenses: state.expenses,
		monthlyBudget: state.monthlyBudget,
		hasSeeded: state.hasSeeded
	})
}));
function CategoryBreakdown({ expenses, onSelect, active = "all" }) {
	const totals = /* @__PURE__ */ new Map();
	for (const item of expenses) totals.set(item.category, (totals.get(item.category) ?? 0) + item.amount);
	const rows = CATEGORIES.map((cat) => ({
		...cat,
		total: totals.get(cat.id) ?? 0
	})).filter((row) => row.total > 0).sort((a, b) => b.total - a.total);
	const max = rows[0]?.total ?? 0;
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "Belum ada pengeluaran di bulan ini."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "flex flex-col gap-3",
		children: rows.map((row) => {
			const Icon = row.icon;
			const width = max > 0 ? Math.max(6, row.total / max * 100) : 0;
			const selected = active === row.id;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onSelect?.(row.id),
				className: "flex w-full flex-col gap-1.5 text-left",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							className: "size-3.5 text-muted-foreground",
							strokeWidth: 1.75
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: selected ? "font-medium" : "",
							children: row.label
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums text-sm text-muted-foreground",
						children: formatCompactId(row.total)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-1.5 overflow-hidden rounded-full bg-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full rounded-full bg-primary transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
						style: { width: `${width}%` },
						title: formatRupiah(row.total)
					})
				})]
			}) }, row.id);
		})
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-[background-color,color,opacity,box-shadow,transform] duration-150 ease-out active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
			outline: "border border-border bg-transparent text-foreground hover:bg-muted",
			ghost: "text-foreground hover:bg-muted",
			destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
		},
		size: {
			default: "h-11 rounded-md px-4",
			sm: "h-9 rounded-sm px-3 text-sm",
			lg: "h-12 rounded-lg px-5 text-base",
			icon: "size-11 rounded-md",
			"icon-sm": "size-9 rounded-sm"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		"data-slot": "button",
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		"data-slot": "input",
		className: cn("flex h-11 w-full rounded-md border border-input bg-card px-3 text-base text-foreground shadow-none outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
		"data-slot": "label",
		className: cn("text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-50", className),
		...props
	});
}
var QUICK_AMOUNTS = [
	1e4,
	2e4,
	5e4,
	1e5
];
function ExpenseForm({ initial, onSubmit, onDelete, submitLabel }) {
	const [amountRaw, setAmountRaw] = (0, import_react.useState)(initial ? String(initial.amount) : "");
	const [category, setCategory] = (0, import_react.useState)(initial?.category ?? "makanan");
	const [note, setNote] = (0, import_react.useState)(initial?.note ?? "");
	const [date, setDate] = (0, import_react.useState)(initial?.date ?? isoDate(/* @__PURE__ */ new Date()));
	(0, import_react.useEffect)(() => {
		setAmountRaw(initial ? String(initial.amount) : "");
		setCategory(initial?.category ?? "makanan");
		setNote(initial?.note ?? "");
		setDate(initial?.date ?? isoDate(/* @__PURE__ */ new Date()));
	}, [initial]);
	const amount = amountRaw ? Number.parseInt(amountRaw, 10) || 0 : 0;
	const canSave = amount > 0 && Boolean(date);
	function handleAmountChange(value) {
		const digits = value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
		setAmountRaw(digits);
	}
	function handleSubmit(event) {
		event.preventDefault();
		if (!canSave) return;
		onSubmit({
			amount,
			category,
			note,
			date
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: handleSubmit,
		className: "flex flex-col gap-5 px-5 pb-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "amount",
						className: "text-muted-foreground",
						children: "Jumlah"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline gap-2 rounded-lg bg-muted px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-lg font-medium text-muted-foreground",
							children: "Rp"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "amount",
							inputMode: "numeric",
							autoComplete: "off",
							placeholder: "0",
							value: amount ? formatRupiahPlain(amount) : "",
							onChange: (e) => handleAmountChange(e.target.value),
							className: "min-w-0 flex-1 bg-transparent font-display text-4xl font-medium tracking-tight text-foreground outline-none placeholder:text-muted-foreground/40",
							"aria-label": "Jumlah pengeluaran"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: QUICK_AMOUNTS.map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setAmountRaw(String(amount + value)),
							className: "h-9 rounded-full border border-border bg-card px-3 text-xs font-medium text-muted-foreground transition-[background-color,color] duration-150 hover:bg-muted hover:text-foreground",
							children: ["+", formatRupiahPlain(value)]
						}, value))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-muted-foreground",
					children: "Kategori"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-5 gap-2",
					children: CATEGORIES.map((item) => {
						const Icon = item.icon;
						const selected = category === item.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setCategory(item.id),
							className: cn("flex min-h-16 flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-center transition-[background-color,color,box-shadow] duration-150", selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-4",
								strokeWidth: 1.75
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs leading-tight font-medium",
								children: item.label
							})]
						}, item.id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "note",
						className: "text-muted-foreground",
						children: "Catatan"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "note",
						maxLength: 80,
						placeholder: "Mis. Nasi Padang",
						value: note,
						onChange: (e) => setNote(e.target.value)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "date",
						className: "text-muted-foreground",
						children: "Tanggal"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "date",
						type: "date",
						value: date,
						onChange: (e) => setDate(e.target.value)
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 pt-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					size: "lg",
					disabled: !canSave,
					className: "w-full",
					children: submitLabel
				}), onDelete ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					className: "w-full text-destructive hover:bg-destructive/10 hover:text-destructive",
					onClick: onDelete,
					children: "Hapus catatan"
				}) : null]
			})
		]
	});
}
function groupByDate(expenses) {
	const map = /* @__PURE__ */ new Map();
	const sorted = [...expenses].sort((a, b) => {
		if (a.date === b.date) return b.createdAt - a.createdAt;
		return a.date < b.date ? 1 : -1;
	});
	for (const item of sorted) {
		const list = map.get(item.date) ?? [];
		list.push(item);
		map.set(item.date, list);
	}
	return Array.from(map.entries());
}
function ExpenseList({ expenses, onSelect }) {
	const groups = groupByDate(expenses);
	if (groups.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-card px-5 py-10 text-center shadow-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-lg font-medium",
			children: "Belum ada catatan"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: "Catat pengeluaran pertama di bulan ini."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col gap-6",
		children: groups.map(([date, items]) => {
			const dayTotal = items.reduce((sum, item) => sum + item.amount, 0);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex items-baseline justify-between px-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-medium",
						children: formatDayHeading(date)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "tabular-nums text-xs text-muted-foreground",
						children: formatRupiah(dayTotal)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "overflow-hidden rounded-xl bg-card shadow-card",
					children: items.map((item, index) => {
						const cat = CATEGORY_MAP[item.category];
						const Icon = cat.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onSelect(item),
							className: cn("flex w-full items-center gap-3 px-4 py-3.5 text-left transition-[background-color] duration-150 hover:bg-muted/60", index > 0 && "border-t border-border"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										className: "size-4",
										strokeWidth: 1.75
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate text-sm font-medium",
										children: item.note || cat.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-xs text-muted-foreground",
										children: cat.label
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "shrink-0 tabular-nums text-sm font-medium",
									children: formatRupiah(item.amount)
								})
							]
						}) }, item.id);
					})
				})]
			}, date);
		})
	});
}
function WeekStrip({ expenses }) {
	const today = startOfDay(/* @__PURE__ */ new Date());
	const days = Array.from({ length: 7 }, (_, i) => {
		const d = subDays(today, 6 - i);
		const key = isoDate(d);
		return {
			date: d,
			key,
			total: expenses.filter((item) => item.date === key).reduce((sum, item) => sum + item.amount, 0),
			isToday: i === 6
		};
	});
	const max = Math.max(...days.map((d) => d.total), 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-end justify-between gap-2",
		children: days.map((day) => {
			const height = Math.max(6, Math.round(day.total / max * 64));
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-16 w-full items-end justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("w-full max-w-7 rounded-sm transition-[height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]", day.total === 0 ? "bg-muted" : day.isToday ? "bg-primary" : "bg-primary/45"),
						style: { height }
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("text-xs font-medium", day.isToday ? "text-foreground" : "text-muted-foreground"),
					children: format(day.date, "EEEEE", { locale: id })
				})]
			}, day.key);
		})
	});
}
var AlertDialog = Root2;
var AlertDialogPortal = Portal2;
function AlertDialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay2, {
		className: cn("fixed inset-0 z-50 bg-overlay", className),
		...props
	});
}
function AlertDialogContent({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		className: cn("fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-card p-5 text-card-foreground shadow-card outline-none", className),
		...props
	})] });
}
function AlertDialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1.5", className),
		...props
	});
}
function AlertDialogFooter({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
		...props
	});
}
function AlertDialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title2, {
		className: cn("font-display text-xl font-medium tracking-tight", className),
		...props
	});
}
function AlertDialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description2, {
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
function AlertDialogAction({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
		className: cn(buttonVariants(), className),
		...props
	});
}
function AlertDialogCancel({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cancel, {
		className: cn(buttonVariants({ variant: "outline" }), className),
		...props
	});
}
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
function DialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
		className: cn("fixed inset-0 z-50 bg-overlay data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
		...props
	});
}
function DialogContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-card p-5 text-card-foreground shadow-card outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute top-3 right-3 rounded-sm p-2 text-muted-foreground transition-[background-color,color] duration-150 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Tutup"
			})]
		})]
	})] });
}
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1.5 pr-8", className),
		...props
	});
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("font-display text-xl font-medium tracking-tight", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
var Drawer$1 = Drawer.Root;
Drawer.Trigger;
var DrawerPortal = Drawer.Portal;
Drawer.Close;
function DrawerOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Overlay, {
		className: cn("fixed inset-0 z-50 bg-overlay", className),
		...props
	});
}
function DrawerContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Drawer.Content, {
		className: cn("fixed inset-x-0 bottom-0 z-50 mx-auto mt-24 flex max-h-dvh w-full max-w-lg flex-col rounded-t-2xl bg-card text-card-foreground outline-none", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mt-3 mb-1 h-1 w-10 shrink-0 rounded-full bg-border" }), children]
	})] });
}
function DrawerHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1 px-5 pt-3 pb-2", className),
		...props
	});
}
function DrawerTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Title, {
		className: cn("font-display text-xl font-medium tracking-tight", className),
		...props
	});
}
function DrawerDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Description, {
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
function currentMonth() {
	const now = /* @__PURE__ */ new Date();
	return {
		year: now.getFullYear(),
		month: now.getMonth()
	};
}
function KeluarApp() {
	const expenses = useExpenseStore((s) => s.expenses);
	const monthlyBudget = useExpenseStore((s) => s.monthlyBudget);
	const addExpense = useExpenseStore((s) => s.addExpense);
	const updateExpense = useExpenseStore((s) => s.updateExpense);
	const deleteExpense = useExpenseStore((s) => s.deleteExpense);
	const setBudget = useExpenseStore((s) => s.setBudget);
	const clearAll = useExpenseStore((s) => s.clearAll);
	const [view, setView] = (0, import_react.useState)(currentMonth);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [formOpen, setFormOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [budgetOpen, setBudgetOpen] = (0, import_react.useState)(false);
	const [settingsOpen, setSettingsOpen] = (0, import_react.useState)(false);
	const [clearOpen, setClearOpen] = (0, import_react.useState)(false);
	const [deleteOpen, setDeleteOpen] = (0, import_react.useState)(false);
	const [budgetDraft, setBudgetDraft] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const finish = () => {
			useExpenseStore.getState().seedIfEmpty();
		};
		if (useExpenseStore.persist.hasHydrated()) {
			finish();
			return;
		}
		const unsub = useExpenseStore.persist.onFinishHydration(finish);
		useExpenseStore.persist.rehydrate();
		return unsub;
	}, []);
	const prefix = monthPrefix(view.year, view.month);
	const monthExpenses = (0, import_react.useMemo)(() => expenses.filter((item) => item.date.startsWith(prefix)), [expenses, prefix]);
	const visible = (0, import_react.useMemo)(() => filter === "all" ? monthExpenses : monthExpenses.filter((item) => item.category === filter), [monthExpenses, filter]);
	const total = monthExpenses.reduce((sum, item) => sum + item.amount, 0);
	const now = /* @__PURE__ */ new Date();
	const isCurrentMonth = view.year === now.getFullYear() && view.month === now.getMonth();
	const elapsedDays = isCurrentMonth ? now.getDate() : daysInMonth(view.year, view.month);
	const dailyAvg = elapsedDays > 0 ? Math.round(total / elapsedDays) : 0;
	const budgetPct = monthlyBudget > 0 ? Math.min(999, total / monthlyBudget * 100) : 0;
	const overBudget = monthlyBudget > 0 && total > monthlyBudget;
	const todayIso = isoDate(now);
	const todayTotal = expenses.filter((item) => item.date === todayIso).reduce((sum, item) => sum + item.amount, 0);
	function shiftMonth(delta) {
		setView((prev) => {
			const d = new Date(prev.year, prev.month + delta, 1);
			return {
				year: d.getFullYear(),
				month: d.getMonth()
			};
		});
		setFilter("all");
	}
	function openCreate() {
		setEditing(null);
		setFormOpen(true);
	}
	function openEdit(expense) {
		setEditing(expense);
		setFormOpen(true);
	}
	function handleSubmit(draft) {
		if (editing) {
			updateExpense(editing.id, draft);
			toast("Catatan diperbarui");
		} else {
			addExpense(draft);
			toast("Pengeluaran dicatat");
		}
		setFormOpen(false);
		setEditing(null);
	}
	function handleDelete() {
		if (!editing) return;
		deleteExpense(editing.id);
		setDeleteOpen(false);
		setFormOpen(false);
		setEditing(null);
		toast("Catatan dihapus");
	}
	function openBudget() {
		setBudgetDraft(monthlyBudget ? String(monthlyBudget) : "");
		setBudgetOpen(true);
	}
	function saveBudget() {
		const value = Number.parseInt(budgetDraft.replace(/\D/g, ""), 10) || 0;
		setBudget(value);
		setBudgetOpen(false);
		toast(value > 0 ? "Anggaran disimpan" : "Anggaran dihapus");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-background pb-28 text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 pt-6 pb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-widest text-muted-foreground uppercase",
					children: "Buku kas"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-medium tracking-tight",
					children: "Keluar"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "Pengaturan",
						onClick: () => setSettingsOpen(true),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, {})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto grid max-w-5xl gap-6 px-4 pt-4 lg:grid-cols-2 lg:items-start",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "flex flex-col gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-card p-5 shadow-card",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "icon-sm",
											"aria-label": "Bulan sebelumnya",
											onClick: () => shiftMonth(-1),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-medium",
											children: formatMonthTitle(view.year, view.month)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "icon-sm",
											"aria-label": "Bulan berikutnya",
											onClick: () => shiftMonth(1),
											disabled: isCurrentMonth,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {})
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-5 text-sm text-muted-foreground",
									children: "Pengeluaran bulan ini"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display mt-1 text-4xl leading-none font-medium tracking-tight tabular-nums sm:text-5xl",
									children: formatRupiah(total)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: openBudget,
									className: "mt-5 flex w-full flex-col gap-2 text-left",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5 text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-3.5" }), monthlyBudget > 0 ? `Anggaran ${formatRupiah(monthlyBudget)}` : "Atur anggaran bulan ini"]
										}), monthlyBudget > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: cn("tabular-nums font-medium", overBudget ? "text-destructive" : "text-foreground"),
											children: [Math.round(budgetPct), "%"]
										}) : null]
									}), monthlyBudget > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-1.5 overflow-hidden rounded-full bg-muted",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: cn("h-full rounded-full transition-[width,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]", overBudget ? "bg-destructive" : "bg-primary"),
											style: { width: `${Math.min(100, budgetPct)}%` }
										})
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1.5 rounded-full bg-muted" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
									className: "mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-xs text-muted-foreground",
											children: "Hari ini"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mt-0.5 truncate text-sm font-medium tabular-nums",
											children: formatRupiah(isCurrentMonth ? todayTotal : 0)
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-xs text-muted-foreground",
											children: "Rata-rata / hari"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mt-0.5 truncate text-sm font-medium tabular-nums",
											children: formatRupiah(dailyAvg)
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-xs text-muted-foreground",
											children: "Transaksi"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mt-0.5 text-sm font-medium tabular-nums",
											children: monthExpenses.length
										})] })
									]
								})
							]
						}),
						isCurrentMonth ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-card p-5 shadow-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mb-4 text-sm font-medium",
								children: "Tujuh hari terakhir"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeekStrip, { expenses })]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-card p-5 shadow-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-sm font-medium",
									children: "Kategori"
								}), filter !== "all" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setFilter("all"),
									className: "text-xs font-medium text-primary",
									children: "Tampilkan semua"
								}) : null]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryBreakdown, {
								expenses: monthExpenses,
								active: filter,
								onSelect: (id) => setFilter((prev) => prev === id ? "all" : id)
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "flex flex-col gap-3 pb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end justify-between gap-3 px-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-medium tracking-tight",
							children: filter === "all" ? "Riwayat" : CATEGORIES.find((c) => c.id === filter)?.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [visible.length, " catatan"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExpenseList, {
						expenses: visible,
						onSelect: openEdit
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-background via-background/90 to-transparent pt-8 pb-[max(1.25rem,env(safe-area-inset-bottom))]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-auto mx-auto max-w-5xl px-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "lg",
						className: "h-12 w-full rounded-lg",
						onClick: openCreate,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Catat pengeluaran"]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer$1, {
				open: formOpen,
				onOpenChange: (open) => {
					setFormOpen(open);
					if (!open) setEditing(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerTitle, { children: editing ? "Ubah catatan" : "Catat pengeluaran" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerDescription, { children: editing ? "Perbarui jumlah, kategori, atau tanggal." : "Tulis jumlah, pilih kategori, simpan." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-y-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExpenseForm, {
						initial: editing,
						submitLabel: editing ? "Simpan perubahan" : "Simpan",
						onSubmit: handleSubmit,
						onDelete: editing ? () => setDeleteOpen(true) : void 0
					}, editing?.id ?? "new")
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: budgetOpen,
				onOpenChange: setBudgetOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Anggaran bulanan" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Batas pengeluaran yang ingin kamu jaga setiap bulan." })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "budget",
							className: "text-muted-foreground",
							children: "Jumlah (Rp)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "budget",
							inputMode: "numeric",
							value: budgetDraft ? formatRupiahPlain(Number.parseInt(budgetDraft, 10) || 0) : "",
							onChange: (e) => setBudgetDraft(e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "")),
							placeholder: "4.000.000"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: saveBudget,
						className: "w-full",
						children: "Simpan anggaran"
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: settingsOpen,
				onOpenChange: setSettingsOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Pengaturan" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Data tersimpan di perangkat ini." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "justify-start",
						onClick: () => {
							setSettingsOpen(false);
							openBudget();
						},
						children: "Atur anggaran"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "justify-start text-destructive hover:bg-destructive/10 hover:text-destructive",
						onClick: () => {
							setSettingsOpen(false);
							setClearOpen(true);
						},
						children: "Hapus semua catatan"
					})]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: deleteOpen,
				onOpenChange: setDeleteOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Hapus catatan ini?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "Pengeluaran ini akan dihapus dari buku kas." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Batal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
					onClick: handleDelete,
					children: "Hapus"
				})] })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: clearOpen,
				onOpenChange: setClearOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Hapus semua catatan?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "Seluruh riwayat pengeluaran di perangkat ini akan dihapus." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Batal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
					onClick: () => {
						clearAll();
						setClearOpen(false);
						toast("Semua catatan dihapus");
					},
					children: "Hapus semua"
				})] })] })
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeluarApp, {});
}
//#endregion
export { Home as component };
