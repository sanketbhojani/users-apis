import { useState, useEffect } from 'react';
import axios from 'axios';

// API Base URL
const API_URL = 'https://users-apis.onrender.com/api/user/users';

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    city: '',
    hobbies: ''
  });
  const [profileImage, setProfileImage] = useState(null);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      showToast('Error fetching users from server.', true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const showToast = (msg, isError = false) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      age: '',
      city: '',
      hobbies: ''
    });
    setProfileImage(null);
    setEditingUserId(null);
    document.getElementById('userProfileImage').value = '';
  };

  const handleEdit = (user) => {
    setEditingUserId(user._id);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      age: user.age,
      city: user.city,
      hobbies: user.hobbies ? user.hobbies.join(', ') : ''
    });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      setLoading(true);
      const res = await axios.delete(`${API_URL}/${id}`);
      if (res.data.success) {
        showToast('User deleted successfully');
        fetchUsers();
      }
    } catch (error) {
      showToast('Failed to delete user', true);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const submitData = new FormData();
    submitData.append('firstName', formData.firstName);
    submitData.append('lastName', formData.lastName);
    submitData.append('age', formData.age);
    submitData.append('city', formData.city);
    submitData.append('hobbies', formData.hobbies);
    
    if (profileImage) {
      submitData.append('userProfileImage', profileImage);
    }

    try {
      if (editingUserId) {
        // Update user
        const res = await axios.put(`${API_URL}/${editingUserId}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) {
          showToast('User updated successfully');
          resetForm();
          fetchUsers();
        }
      } else {
        // Add new user
        const res = await axios.post(API_URL, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) {
          showToast('User added successfully');
          resetForm();
          fetchUsers();
        }
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Something went wrong', true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      {/* Background elements */}
      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <header className="glass-header">
        <h1>User Management Hub</h1>
        <p>Live connected to: {API_URL}</p>
      </header>

      <main className="dashboard-grid">
        {/* Form Section */}
        <section className="glass-card form-section">
          <h2>{editingUserId ? 'Edit User' : 'Add New User'}</h2>
          
          <form onSubmit={handleSubmit} id="user-form">
            <div className="input-group">
              <label>First Name</label>
              <input 
                type="text" 
                name="firstName" 
                value={formData.firstName} 
                onChange={handleInputChange} 
                required 
                placeholder="e.g. John" 
              />
            </div>
            
            <div className="input-group">
              <label>Last Name</label>
              <input 
                type="text" 
                name="lastName" 
                value={formData.lastName} 
                onChange={handleInputChange} 
                required 
                placeholder="e.g. Doe" 
              />
            </div>

            <div className="input-group">
              <label>Age</label>
              <input 
                type="number" 
                name="age" 
                value={formData.age} 
                onChange={handleInputChange} 
                required 
                min="1" 
                placeholder="e.g. 25" 
              />
            </div>

            <div className="input-group">
              <label>City</label>
              <select name="city" value={formData.city} onChange={handleInputChange} required>
                <option value="" disabled>Select a City</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Pune">Pune</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Chennai">Chennai</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Surat">Surat</option>
                <option value="Jaipur">Jaipur</option>
              </select>
            </div>

            <div className="input-group">
              <label>Hobbies (comma-separated)</label>
              <input 
                type="text" 
                name="hobbies" 
                value={formData.hobbies} 
                onChange={handleInputChange} 
                placeholder="e.g. Reading, Cricket" 
              />
            </div>

            <div className="input-group">
              <label>Profile Image {editingUserId && '(Optional)'}</label>
              <input 
                type="file" 
                id="userProfileImage" 
                name="userProfileImage" 
                onChange={handleFileChange} 
                accept="image/*" 
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : (editingUserId ? 'Update User' : 'Save User')}
              </button>
              {editingUserId && (
                <button type="button" className="btn-secondary" onClick={resetForm} disabled={submitting}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Table Section */}
        <section className="glass-card table-section">
          <h2>Registered Users</h2>
          
          {loading ? (
            <div className="loader-container">
              <div className="spinner"></div>
              <p>Fetching users from server...</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Profile</th>
                    <th>Name</th>
                    <th>Age</th>
                    <th>City</th>
                    <th>Hobbies</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                        No users found. Add one to get started!
                      </td>
                    </tr>
                  ) : (
                    users.map(user => (
                      <tr key={user._id}>
                        <td>
                          {user.userProfileImage && user.userProfileImage.url ? (
                            <img src={user.userProfileImage.url} alt="Profile" className="profile-img" />
                          ) : (
                            <div className="no-image">No Img</div>
                          )}
                        </td>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.age}</td>
                        <td>{user.city}</td>
                        <td>
                          <div className="hobbies-badges">
                            {user.hobbies && user.hobbies.map((hobby, index) => (
                              <span key={index} className="badge">{hobby}</span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <button className="btn-edit" onClick={() => handleEdit(user)}>Edit</button>
                          <button className="btn-danger" onClick={() => handleDelete(user._id)}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Toast Notification */}
      <div className={`toast ${toastMessage ? 'show' : ''}`}>
        {toastMessage}
      </div>
    </div>
  );
}

export default App;
