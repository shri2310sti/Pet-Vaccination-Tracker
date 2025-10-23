import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [petName, setPetName] = useState('');
  const [dob, setDob] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      fetchSchedule(storedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();

      localStorage.setItem('userId', data.user_id);
      setUserId(data.user_id);
      setPetName(data.pet_name);
      setSchedule(data.schedule);
      setIsRegistered(true);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!petName || !dob) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          pet_name: petName,
          date_of_birth: dob,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const data = await response.json();

      localStorage.setItem('userId', data.user_id);
      setUserId(data.user_id);
      setSchedule(data.schedule);
      setIsRegistered(true);
      setEmail('');
      setPassword('');
      setPetName('');
      setDob('');
    } catch (error) {
      console.error('Registration failed:', error);
      setError(error.message || 'Registration failed. Please try again.');
    }
  };

  const fetchSchedule = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/schedule/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch schedule');
      }

      const data = await response.json();

      setPetName(data.pet_name);
      setSchedule(data.schedule);
      setUserId(id);
      setIsRegistered(true);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
      // Clear invalid userId
      localStorage.removeItem('userId');
      setUserId('');
      setIsRegistered(false);
      setLoading(false);
    }
  };

  const handleEdit = (vaccine) => {
    setSelectedVaccine(vaccine);
    setShowDialog(true);
    setImagePreview(vaccine.image_url || '');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitVaccine = async () => {
    if (!imageFile && selectedVaccine.status !== 'done') {
      alert('Please upload proof image');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/update-vaccine/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vaccine_id: selectedVaccine.id,
          is_done: true,
          image_data: imagePreview,
        }),
      });

      const data = await response.json();
      setSchedule(data.schedule);
      setShowDialog(false);
      setImageFile(null);
      setImagePreview('');
      setSelectedVaccine(null);
    } catch (error) {
      console.error('Update failed:', error);
      alert('Update failed. Please try again.');
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setImageFile(null);
    setImagePreview('');
    setSelectedVaccine(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    setUserId('');
    setIsRegistered(false);
    setSchedule([]);
    setPetName('');
    setDob('');
    setEmail('');
    setPassword('');
    setError('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const groupByVaccine = () => {
    const grouped = {};
    schedule.forEach(item => {
      if (!grouped[item.vaccine]) {
        grouped[item.vaccine] = [];
      }
      grouped[item.vaccine].push(item);
    });
    return grouped;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container">
        <div className="register-card">
          <h1>🐾 Loading...</h1>
        </div>
      </div>
    );
  }

  // Show login/register form
  if (!isRegistered) {
    return (
      <div className="container">
        <div className="register-card">
          <h1>🐾 Pet Vaccination Tracker</h1>

          <div className="auth-toggle">
            <button
              className={isLoginMode ? 'active' : ''}
              onClick={() => {
                setIsLoginMode(true);
                setError('');
              }}
            >
              Login
            </button>
            <button
              className={!isLoginMode ? 'active' : ''}
              onClick={() => {
                setIsLoginMode(false);
                setError('');
              }}
            >
              Register
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {isLoginMode ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button type="submit" className="btn-primary">Login</button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                />
              </div>
              <div className="form-group">
                <label>Pet Name</label>
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="Enter your pet's name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary">Register Pet</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const groupedSchedule = groupByVaccine();

  return (
    <div className="container">
      <div className="header">
        <h1>🐾 Vaccination Schedule for {petName}</h1>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </div>

      <div className="schedule-container">
        {Object.entries(groupedSchedule).map(([vaccine, items]) => (
          <div key={vaccine} className="vaccine-section">
            <h2>{vaccine}</h2>
            <div className="vaccine-list">
              {items.map((item) => (
                <div key={item.id} className={`vaccine-item ${item.status}`}>
                  <div className="vaccine-info">
                    <div className="vaccine-category">{item.category}</div>
                    <div className="vaccine-date">Due: {formatDate(item.due_date)}</div>
                    <div className={`vaccine-status ${item.status}`}>
                      {item.status === 'done' ? '✓ Completed' : 'Pending'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleEdit(item)}
                    className="btn-edit"
                  >
                    {item.status === 'done' ? 'View' : 'Edit'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showDialog && (
        <div className="dialog-overlay" onClick={handleCloseDialog}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedVaccine.vaccine} - {selectedVaccine.category}</h2>
            <p>Due Date: {formatDate(selectedVaccine.due_date)}</p>

            {selectedVaccine.status === 'done' ? (
              <div className="completed-section">
                <div className="status-badge done">✓ Vaccination Completed</div>

                {selectedVaccine.image_url && (
                  <div className="image-preview">
                    <img
                      src={`http://localhost:8000${selectedVaccine.image_url}`}
                      alt="Vaccine proof"
                    />
                  </div>
                )}

                {selectedVaccine.proof_added_at && (
                  <p className="proof-time">
                    📅 Completed On:{" "}
                    {new Date(selectedVaccine.proof_added_at).toLocaleString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="upload-section">
                <label className="file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  Choose Proof Image
                </label>

                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}

                <button
                  onClick={handleSubmitVaccine}
                  className="btn-primary"
                  disabled={!imageFile}
                >
                  Mark as Done
                </button>
              </div>
            )}

            <button onClick={handleCloseDialog} className="btn-secondary">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;