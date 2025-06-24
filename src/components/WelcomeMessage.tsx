'use client'

interface WelcomeMessageProps {
  userEmail: string
}

export default function WelcomeMessage({ userEmail }: WelcomeMessageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
      <div className="text-center px-6 -mt-20">
        <div className="space-y-4">
          <h1 className="text-3xl font-extralight text-gray-900 tracking-wide">
            Thank you for signing up
          </h1>
          
          <p className="text-lg text-gray-500 font-light">
            Your investor account is being reviewed and will be activated shortly.
          </p>
        </div>
      </div>
    </div>
  )
}