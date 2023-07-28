import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SignupStyle from './login.module.css';

const ResetPasswordConfirm = () => {
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState(''); 
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const { uid, token } = useParams();  // get uid and token from URL
  
    const handleSubmit = (e) => {
      e.preventDefault();
  
      axios
        .post(`http://localhost:8000/api/password/reset/${uid}/${token}/`, {
          password: password,
          password2: password2
        })
        .then(() => {
          navigate('/login');
        })
        .catch((error) => {
          console.log(error);
          if (error.response) {
            setErrors(error.response.data);
          }
        });
    };
  
    return (
      <body className={SignupStyle.body}>
      <form onSubmit={handleSubmit} className="container">
        <div className={SignupStyle.log}>
          <h1>Reset Password</h1>
        </div>
        <div className={SignupStyle.container}>
          <input className={SignupStyle.input} type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} required />
          {errors.password && errors.password.map((error, index) => <p key={index} className="error">{error}</p>)}
  
          <input className={SignupStyle.input} type="password" placeholder="Confirm new password" value={password2} onChange={e => setPassword2(e.target.value)} required />
          {errors.password2 && errors.password2.map((error, index) => <p key={index} className="error">{error}</p>)}
  
          {errors.detail && <p className="error">{errors.detail}</p>} 
  
          <button type="submit" className={SignupStyle.button}>Submit</button>
        </div>
      </form>
      </body>
    );
  };
  
  export default ResetPasswordConfirm;
  