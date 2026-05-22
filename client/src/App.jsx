import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://users-apis.onrender.com/api/user/users';

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    city: '',
    hobbies: []
  });
  const [profileImage, setProfileImage] = useState(null);

  const availableHobbies = ["Cricket", "Coding", "Reading", "Listening"];

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

  const handleCheckboxChange = (hobby) => {
    setFormData(prev => {
      const hobbies = [...prev.hobbies];
      if (hobbies.includes(hobby)) {
        return { ...prev, hobbies: hobbies.filter(h => h !== hobby) };
      } else {
        return { ...prev, hobbies: [...hobbies, hobby] };
      }
    });
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
      hobbies: []
    });
    setProfileImage(null);
    setEditingUserId(null);
    const fileInput = document.getElementById('userProfileImage');
    if (fileInput) fileInput.value = '';
  };

  const handleEdit = (user) => {
    setEditingUserId(user._id);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      age: user.age,
      city: user.city,
      hobbies: user.hobbies || []
    });
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
    submitData.append('hobbies', JSON.stringify(formData.hobbies)); // Send as JSON string for backend
    
    if (profileImage) {
      submitData.append('userProfileImage', profileImage);
    }

    try {
      if (editingUserId) {
        const res = await axios.put(`${API_URL}/${editingUserId}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) {
          showToast('User updated successfully');
          resetForm();
          fetchUsers();
        }
      } else {
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
      {/* Form Card */}
      <div className="card">
        <h2>Student Form</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          
          <div className="input-group">
            <label>First Name</label>
            <input 
              type="text" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleInputChange} 
              required 
              placeholder="Enter first name" 
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
              placeholder="Enter last name" 
            />
          </div>

          <div className="input-group full-width">
            <label>Hobbies</label>
            <div className="checkbox-group">
              {availableHobbies.map(hobby => (
                <label key={hobby} className="checkbox-item">
                  <input 
                    type="checkbox" 
                    checked={formData.hobbies.includes(hobby)} 
                    onChange={() => handleCheckboxChange(hobby)} 
                  />
                  {hobby}
                </label>
              ))}
            </div>
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
            <label>Age</label>
            <input 
              type="number" 
              name="age" 
              value={formData.age} 
              onChange={handleInputChange} 
              required 
              min="1" 
              placeholder="Enter age" 
            />
          </div>

          <div className="input-group full-width">
            <label>Profile Image (Optional)</label>
            <input 
              type="file" 
              id="userProfileImage" 
              name="userProfileImage" 
              onChange={handleFileChange} 
              accept="image/*" 
            />
          </div>

          <div className="submit-btn-container">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Submit'}
            </button>
            {editingUserId && (
              <button type="button" className="btn-secondary" onClick={resetForm} disabled={submitting}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table Card */}
      <div className="card">
        <h2>Student List</h2>
        
        {loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <p style={{marginTop: '1rem', color: '#6b7280'}}>Loading...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Hobbies</th>
                  <th>City</th>
                  <th>Age</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '2rem', color: '#6b7280' }}>
                      No data found. Add someone to the list!
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
                      <td>{user._id.substring(0, 8)}...</td>
                      <td>{user.firstName}</td>
                      <td>{user.lastName}</td>
                      <td>{user.hobbies ? user.hobbies.join(', ') : ''}</td>
                      <td>{user.city}</td>
                      <td>{user.age}</td>
                      <td>
                        <button className="btn-edit" onClick={() => handleEdit(user)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(user._id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      <div className={`toast ${toastMessage ? 'show' : ''}`}>
        {toastMessage}
      </div>
    </div>
  );
}

export default App;
