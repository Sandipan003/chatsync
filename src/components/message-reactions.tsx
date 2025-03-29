'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaceSmileIcon } from '@heroicons/react/24/outline'

interface Reaction {
  emoji: string
  count: number
  users: string[]
}

interface MessageReactionsProps {
  reactions: Reaction[]
  onReact: (emoji: string) => void
  currentUser: string
}

const commonEmojis = ['👍', '❤️', '😊', '🎉', '🤔', '👏']

export function MessageReactions({ reactions, onReact, currentUser }: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false)

  const handleReact = (emoji: string) => {
    onReact(emoji)
    setShowPicker(false)
  }

  return (
    <div className="relative">
      <div className="flex items-center space-x-1">
        {reactions.map((reaction) => (
          <motion.button
            key={reaction.emoji}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleReact(reaction.emoji)}
            className={`px-2 py-1 rounded-full text-sm ${
              reaction.users.includes(currentUser)
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
            title={`${reaction.users.join(', ')} reacted with ${reaction.emoji}`}
          >
            <span className="mr-1">{reaction.emoji}</span>
            <span>{reaction.count}</span>
          </motion.button>
        ))}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPicker(!showPicker)}
          className="p-1 rounded-full hover:bg-secondary"
          title="Add reaction"
        >
          <FaceSmileIcon className="h-4 w-4" />
        </motion.button>
      </div>

      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute bottom-full left-0 mb-2 p-2 bg-popover rounded-lg shadow-lg grid grid-cols-6 gap-1"
          >
            {commonEmojis.map((emoji) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleReact(emoji)}
                className="p-1 hover:bg-secondary rounded"
              >
                {emoji}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 