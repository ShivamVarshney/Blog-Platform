import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import axios from 'axios'
import { Eye } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API_URL from '../config/api'

const Comments = () => {
  const [allComments, setAllComments] = useState([])
  const navigate = useNavigate()

  const getTotalComments = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/v1/comment/my-blogs/comments`,
        { withCredentials: true }
      )

      console.log("API Response:", res.data)

      if (res.data.success) {
        setAllComments(res.data.comments || [])
      }
    } catch (error) {
      console.log("Error fetching comments:", error)
    }
  }

  useEffect(() => {
    getTotalComments()
  }, [])

  return (
    <div className='pb-10 pt-20 md:ml-[320px] min-h-screen'>
      <div className='max-w-6xl mx-auto mt-8'>
        <Card className="w-full p-5 space-y-2 dark:bg-gray-800">

          <Table>
            <TableCaption>A list of your recent comments.</TableCaption>

            <TableHeader>
              <TableRow>
                <TableHead>Blog Title</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Author</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {allComments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No Comments Found
                  </TableCell>
                </TableRow>
              ) : (
                allComments.map((comment, index) => (
                  <TableRow key={index}>
                    
                    <TableCell>
                      {comment?.postId?.title || "No Title"}
                    </TableCell>

                    <TableCell>
                      {comment?.content || "No Comment"}
                    </TableCell>

                    <TableCell>
                      {comment?.userId?.firstName || "Unknown"}
                    </TableCell>

                    <TableCell className="text-center">
                      <Eye
                        className='cursor-pointer'
                        onClick={() =>
                          navigate(`/blogs/${comment?.postId?._id}`)
                        }
                      />
                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>

          </Table>

        </Card>
      </div>
    </div>
  )
}

export default Comments