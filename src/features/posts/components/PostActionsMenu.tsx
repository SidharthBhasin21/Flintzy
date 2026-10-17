import { Copy, Ellipsis, PanelRightOpen, PenLine, RotateCw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { usePostActions } from '../actions/context'
import type { Post } from '../types'

export function PostActionsMenu({
  post,
  busy,
  hideView,
  className,
}: {
  post: Post
  busy?: boolean
  hideView?: boolean
  className?: string
}) {
  const actions = usePostActions()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Post actions"
          className={cn('data-[state=open]:bg-hover data-[state=open]:text-ink', className)}
        >
          <Ellipsis strokeWidth={1.75} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!hideView && (
          <DropdownMenuItem onSelect={() => actions.view(post)}>
            <PanelRightOpen strokeWidth={1.75} />
            Open details
          </DropdownMenuItem>
        )}
        {post.status !== 'published' && (
          <DropdownMenuItem disabled={busy} onSelect={() => actions.edit(post)}>
            <PenLine strokeWidth={1.75} />
            {post.status === 'failed' ? 'Edit and reschedule' : 'Edit'}
          </DropdownMenuItem>
        )}
        {post.status === 'failed' && (
          <DropdownMenuItem disabled={busy} onSelect={() => actions.retry(post)}>
            <RotateCw strokeWidth={1.75} />
            Retry now
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => actions.copy(post)}>
          <Copy strokeWidth={1.75} />
          Copy text
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive disabled={busy} onSelect={() => actions.requestDelete(post)}>
          <Trash2 strokeWidth={1.75} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
