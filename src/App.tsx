import { createBrowserRouter, RouterProvider } from 'react-router'
import { Toaster } from 'sonner'
import { AppShell } from '@/components/shared/AppShell'
import { PostActionsProvider } from '@/features/posts/actions/PostActionsProvider'
import { PostsProvider } from '@/features/posts/store/PostsProvider'
import { QueuePage } from '@/pages/QueuePage'

const router = createBrowserRouter([
  {
    element: (
      <PostActionsProvider>
        <AppShell />
      </PostActionsProvider>
    ),
    children: [
      { index: true, element: <QueuePage /> },
      {
        path: 'calendar',
        // Split out: the month grid isn't needed for the default queue view.
        lazy: () => import('@/pages/CalendarPage').then((m) => ({ Component: m.CalendarPage })),
      },
      { path: '*', element: <QueuePage /> },
    ],
  },
])

export default function App() {
  return (
    <PostsProvider>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-center"
        offset={16}
        mobileOffset={12}
        toastOptions={{
          classNames: {
            toast:
              '!rounded-lg !border !border-line !bg-surface !text-ink !shadow-pop !font-sans !text-[13px] !gap-2.5 !py-3 !px-3.5',
            title: '!font-medium',
            description: '!text-ink-2 !text-[12.5px]',
            actionButton: '!bg-primary !text-primary-ink !rounded-md !h-7 !px-2.5 !text-[12.5px] !font-medium',
            success: '[&_[data-icon]]:!text-published-dot',
            error: '[&_[data-icon]]:!text-failed-dot',
          },
        }}
      />
    </PostsProvider>
  )
}
