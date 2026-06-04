export default function ProfileCard({ 
  name, 
  username, 
  email,
  avatar, 
  postsCount = 0, 
  followersCount = 0, 
  followingCount = 0,
  onFollowersClick,
  onFollowingClick
}) {
  const defaultAvatar = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDR8H0rgV-zmSodkT_erGjzA_VhfWE22Pg7Q&s";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm transition duration-200 hover:shadow-md max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center gap-5">
        {/* Avatar */}
        <img
          src={avatar || defaultAvatar}
          alt={name}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-gray-100 shadow-sm"
        />

        {/* User Info */}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{name}</h1>
          <p className="text-sm font-semibold text-gray-500 mt-1">@{username}</p>
          <p className="text-xs text-gray-400 mt-1">{email}</p>
          
          {/* Stats Counters */}
          <div className="flex items-center justify-center sm:justify-start gap-6 mt-4 pt-3 border-t border-gray-50">
            <div className="text-center sm:text-left">
              <span className="block text-lg font-bold text-gray-900 leading-none">{postsCount}</span>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-1 block">Posts</span>
            </div>
            
            <div 
              className={`text-center sm:text-left ${onFollowersClick ? 'cursor-pointer hover:opacity-70 transition' : ''}`}
              onClick={onFollowersClick}
            >
              <span className="block text-lg font-bold text-gray-900 leading-none">{followersCount}</span>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-1 block">Followers</span>
            </div>

            <div 
              className={`text-center sm:text-left ${onFollowingClick ? 'cursor-pointer hover:opacity-70 transition' : ''}`}
              onClick={onFollowingClick}
            >
              <span className="block text-lg font-bold text-gray-900 leading-none">{followingCount}</span>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-1 block">Following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
