// // components/Account.jsx
// import { User } from 'lucide-react';

// export default function Account() {
//   return (
//     <div className="max-w-6xl mx-auto space-y-12">
//       <section className="space-y-6">
//         <div className="flex items-center gap-3">
//           <h2 className="text-2xl font-semibold" style={{ color: 'var(--txt)' }}>
//             Account Settings
//           </h2>
//         </div>

//         {/* Account content placeholder */}
//         <div 
//           className="rounded-2xl p-12 text-center border-8 border-[var(--bg-ter)]"
//           style={{ backgroundColor: 'var(--bg-sec)' }}
//         >
//           <User 
//             className="w-16 h-16 mx-auto mb-4"
//             style={{ color: 'var(--txt-dim)' }}
//           />
//           <p 
//             className="text-lg"
//             style={{ color: 'var(--txt-dim)' }}
//           >
//             Account settings will be available soon
//           </p>
//         </div>
//       </section>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { User, Mail, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../utils/api";



export default function Account() {
  const { user, logout, setUser } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
  // Preview
  const [preview, setPreview] = useState(null);
  const [updating, setUpdating] = useState(false);


  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: ""
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

   //  Add file handler here
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, profilePicture: file });
    setPreview(URL.createObjectURL(file));
  };


  


  const handleUpdate = async (e) => {
  e.preventDefault();
  if (updating) return;
  setUpdating(true);

  try {
    const res = await authAPI.update(formData);

    // ⭐ If we reached here, request succeeded
   const updatedUser = {
  ...user,              // keep existing data (especially profilePicture)
  ...res.data.user     // overwrite with updated fields
};

localStorage.setItem("user", JSON.stringify(updatedUser));
setUser(updatedUser);
setPreview(null);


    alert("Account updated successfully!");
  } catch (err) {
    console.error(err);
    alert("Update failed");
  } finally {
    setUpdating(false);
  }
};


const handleRemovePicture = async () => {
  try {
    const res = await authAPI.removePicture();
    setPreview(null);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    alert("Profile picture removed!");
  } catch (err) {
    alert("Failed to remove picture");
  }
};




  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold" style={{ color: "var(--txt)" }}>
            Account Settings
          </h2>
        </div>

        <div
          className="rounded-2xl p-8 border-2 border-[var(--bg-ter)]"
          style={{ backgroundColor: "var(--bg-sec)" }}
        >
          <form onSubmit={handleUpdate} className="space-y-6">
            {/* Profile Picture at the top */}
<div className="flex flex-col items-center space-y-4 mb-6">
  {preview ? (
    // Show preview if user just selected a new file
    <img
      src={preview}
      alt="Profile Preview"
      className="w-24 h-24 rounded-full object-cover border-2 border-[var(--bg-ter)]"
    />
  ) : user?.profilePicture ? (
    // Show saved profile picture from backend
    <img
      src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${user.profilePicture}`}
      alt="Profile"
      className="w-24 h-24 rounded-full object-cover border-2 border-[var(--bg-ter)]"
    />
  ) : (
    // ✅ Default picture instead of empty icon
    <img
      src="/default_picture.png"   // place a default image in your public folder
      alt="Default Profile"
      className="w-24 h-24 rounded-full object-cover border-2 border-[var(--bg-ter)]"
    />
  )}

  {/* hidden file input file name hidden */}
  <input
  type="file"
  accept="image/*"
  onChange={handleFileChange}
  className="hidden"
  id="profilePicture"
/>
 {/* Custom button */}
  <label
    htmlFor="profilePicture"
    className="px-4 py-2 bg-[var(--btn)] text-white rounded cursor-pointer"
  >
    Choose Profile Picture
    </label>
    {/* ✅ Remove button */}
  <button
    type="button"
    onClick={handleRemovePicture}
    className="px-4 py-2 bg-red-500 text-white rounded cursor-pointer"
  >
    Remove Picture
  </button>


</div>
            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--txt)" }}>
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "var(--txt-dim)" }} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border"
                  style={{ backgroundColor: "var(--bg-ter)", borderColor: "var(--bg-ter)", color: "var(--txt)" }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--txt)" }}>
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "var(--txt-dim)" }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border"
                  style={{ backgroundColor: "var(--bg-ter)", borderColor: "var(--bg-ter)", color: "var(--txt)" }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--txt)" }}>
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "var(--txt-dim)" }} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border"
                  style={{ backgroundColor: "var(--bg-ter)", borderColor: "var(--bg-ter)", color: "var(--txt)" }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between">
<button
  type="submit"
  disabled={updating}
  className="px-6 py-3 rounded-lg font-semibold text-white disabled:opacity-50"
  style={{ backgroundColor: "var(--btn)" }}
>
  {updating ? "Updating..." : "Update"}
</button>

              
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}