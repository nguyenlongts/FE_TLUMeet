import { Video, Plus,ArrowRight } from 'lucide-react'
import MeetingCard from '../../components/MeetingCard'
import StatCard from '../../components/StatCard'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../redux/features/auth/authSlice'
import {useEffect, useState } from 'react'
import { useDeleteMeetingApiMutation, useGetAllMeetingByEmailQuery, useJoinMeetingMutation, useLazyCheckRoomCodeQuery } from '../../redux/features/meetings/meetingsApi'
import ScheduleMeetingModal from '../meetings/ScheduleMeetingModal'
import {Form,Input,Button,} from 'antd'
import WaitingRoom from '../meetings/WaitingRoom'
import { useNavigate } from 'react-router-dom'
import DeleteConfirmModal from '../../components/DeleteConfirmModal'
const JoinLinkModal = ({ isOpen, onClose,pushRoomCode,handleWaiting }) => {
  const [form] = Form.useForm()
  const [roomCode, setRoomCode] = useState()
  const [isLoading, setIsLoading] = useState(false)
  const user = useSelector(selectCurrentUser)
  const [checkRoomCode ]=useLazyCheckRoomCodeQuery()
  const [joinMeeting,{error}]=useJoinMeetingMutation()
  const handleSubmit = async ({ roomCode }) => {
    setIsLoading(true)
    setRoomCode(roomCode)
    handleWaiting()
    setRoomCode(roomCode);
    try {
      const resCheckRoomCode=await checkRoomCode(roomCode).unwrap()
      console.log(resCheckRoomCode);
      if(!resCheckRoomCode?.statusCode===200||!resCheckRoomCode){
        form.setFields([{ name: "roomCode", errors: "Phòng họp không tồn tại" }]);
        return;
      }
      const formJoin={
        roomCode:roomCode ,userEmail:user.email, guestName:user.name
      }

      const res=await joinMeeting(formJoin).unwrap()
      console.log(res)
      if(error){console.log(error)}
      if(!error){
        onClose()
      }
      sessionStorage.setItem("joinToken", res?.data?.joinToken);
      pushRoomCode(roomCode)
    } catch(err) {
      console.log(err);
      form.setFields([{ name: "roomCode", errors: [err?.data?.message||"Không thể kết nối tới server"] }]);
    } finally {
      setIsLoading(false);
    }
    setIsLoading(false)
  }

  if (!isOpen) return null

  return (

    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose} 
    >

      <div
        className="relative w-full max-w-md mx-4 bg-[#1a1d2e] border border-white/10 rounded-2xl p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">Tham gia phòng họp</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            label={
              <span className="text-[11px] tracking-widest text-[#5a5478] font-medium">
                MÃ PHÒNG HỌP
              </span>
            }
            name="roomCode"
            rules={[
              { required: true, message: "Vui lòng nhập mã phòng họp" },
              { min: 6, message: "Mã phòng không hợp lệ" },
            ]}
            normalize={(val) => val.toUpperCase()}
          >
            <Input placeholder="VD: MTG-ABC123" className="!font-mono" />
          </Form.Item>

          <Form.Item className="!mb-0 !mt-2">
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
              className="!h-11 !rounded-xl !font-medium !text-sm !bg-gradient-to-r !from-violet-600 !to-purple-500 !border-0 group"
              icon={
                !isLoading && (
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )
              }
              iconPosition="end"
            >
              {isLoading ? "Đang kiểm tra..." : "Tham gia ngay"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

const  Dashboard=()=> {
  const navigate=useNavigate()
  const user=useSelector(selectCurrentUser)
  const [type,setType]=useState("")
  const {data:meetingsRaw}=useGetAllMeetingByEmailQuery(user?.email)
  const meetings=meetingsRaw?.data || []
  console.log(meetings,'meetings');
  const [isScheduleMeetingModalOpen,setIsScheduleMeetingModalOpen]=useState(false)
  const [isJoinLinkModalOpen,setIsJoinLinkModalOpen]=useState(false)
  const [isWaitingRoomOpen,setIsWaitingRoomOpen]=useState(false)
  const [roomCode,setRoomCode]=useState()
  const [editMeeeting,setEditMeeting]=useState()

  const [deleteMeeting,setDeleteMeeting]=useState()
  const [isDeleteConfirmModalOpen,setIsDeleteConfirmModalOpen]=useState(false)
  const [deleteMeetingApi, {isLoading:deleteLoading}]=useDeleteMeetingApiMutation()
  const handleJoinLink =async()=>{
    setIsJoinLinkModalOpen(true)
  }
  const onHostJoined=async()=>{
      setIsWaitingRoomOpen(false)
      navigate(`/meet/${roomCode}`);    
  }
  // const handleEdit=(meeting)=>{
  //   setEditMeeting(meeting)
  //   setType("edit")
  //   setIsScheduleMeetingModalOpen(true)
  // }
  // const handleDelete=(meeting)=>{
  //   setDeleteMeeting(meeting)
  //   setIsDeleteConfirmModalOpen(true)
  // }
  // const confirmDeleteMeeting= async(meeting)=>{
  //   try {
  //     const res=await deleteMeetingApi(meeting)
  //     console.log(res)
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }
  console.log(user, "ú")
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 mx-auto max-w-7xl">

        <h1 className="mb-8 text-3xl font-bold text-white">Meetings</h1>


        <div className="grid grid-cols-3 gap-6 mb-10">
          <StatCard
            icon="🔴"
            label="Number of meetings"
            value="26"
            subtext="This month"
            color="from-orange-400 to-red-500"
          />
          <StatCard
            icon="🟣"
            label="Rescheduled meetings"
            value="24"
            subtext="This month"
            color="from-purple-500 to-pink-500"
          />
          <StatCard
            icon="🔴"
            label="Cancel meetings"
            value="5"
            subtext="This month"
            color="from-red-500 to-pink-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <button onClick={()=>{
          setType("now")
          setIsScheduleMeetingModalOpen(true)
          }} 
          className="flex items-center gap-3 px-6 py-4 font-semibold text-white transition-all transform bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-600 rounded-2xl hover:scale-105">
            <Video className="w-6 h-6" />
            <div className="text-left">
              <div>New Meeting</div>
              <div className="text-xs font-normal text-purple-100">Start New Meeting</div>
            </div>
          </button>

          <button onClick={handleJoinLink} className="flex items-center gap-3 px-6 py-4 font-semibold text-white transition-all border border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 rounded-2xl">
            <Plus className="w-6 h-6" />
            <div className="text-left">
              <div>Join Meeting</div>
              <div className="text-xs font-normal text-slate-400">Via Invitation Link</div>
            </div>
          </button>

          <button onClick={()=>{
            setIsScheduleMeetingModalOpen(true)
            setType("schedule")
            }} className="flex items-center gap-3 px-6 py-4 font-semibold text-white transition-all border border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 rounded-2xl">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-2.3-3.04c-.3-.4-.94-.5-1.42-.1-.48.4-.51 1.04-.1 1.42l3 4c.2.28.53.44.88.44.35 0 .68-.16.88-.44l3.85-5.15c.41-.54.34-1.3-.1-1.42-.44-.12-1.11.05-1.42.45z" />
            </svg>
            <div className="text-left">
              <div>Schedule Meeting</div>
              <div className="text-xs font-normal text-slate-400">Plan Your Meeting</div>
            </div>
          </button>
        </div>

        {/* Today's Meetings */}
        <div className="mb-8">
          <h2 className="mb-2 text-lg font-semibold text-white">You have 6 meetings today!</h2>
          <p className="text-sm text-slate-400">2 hours left for the next meeting</p>
        </div>

        {/* Meetings Grid */}
        <div className="grid grid-cols-3 gap-6">
          {meetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting}/>
          ))}
        </div>
      </div>
      {isScheduleMeetingModalOpen&&<ScheduleMeetingModal isOpen={isScheduleMeetingModalOpen} 
        onClose={()=>setIsScheduleMeetingModalOpen(false)}
        hostEmail={user?.email}
        type={type}
        meeting={editMeeeting}/>
      }
      {
        isJoinLinkModalOpen&&<JoinLinkModal isOpen={isJoinLinkModalOpen} onClose={()=>setIsJoinLinkModalOpen(false)}
         handleWaiting={()=>setIsWaitingRoomOpen(true)} pushRoomCode={(rc)=>setRoomCode(rc)}/>
      }
      {
        isWaitingRoomOpen&&<WaitingRoom roomCode={roomCode} userName={user.name} onCancel={()=>setIsWaitingRoomOpen(false)} onHostJoined={onHostJoined}/>
      }
      {/* {
        isDeleteConfirmModalOpen&&<DeleteConfirmModal isOpen={isDeleteConfirmModalOpen} onClose={()=>setIsDeleteConfirmModalOpen(false)} meeting={deleteMeeting} onConfirm={confirmDeleteMeeting}/>
      } */}
    </div>
  )
}


export default Dashboard