import React, { useState } from 'react';
import axios from 'axios';
import styles from './EditProfile.module.css';  
import Footer from '../components/Footer';

const EditProfile = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords don't match!");
        } else {
            const token = localStorage.getItem('access');
            axios.patch('http://localhost:8000/api/profile/', {
                first_name: firstName,
                last_name: lastName,
                email: email,
                password: password,
                password2: confirmPassword,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((response) => {
                    // handle success
                    console.log(response);
                    alert("Profile updated successfully!");
                })
                .catch((error) => {
                    // handle error
                    console.log(error.response.data);
                    alert("An error occurred while updating your profile.");
                });
        }
    };

    return (
        <div className={styles.root}>
            <div className={styles.group_no}>
                <h2 className={styles.settings}>Edit Profile</h2>
                <a>_______________________________________</a>
            </div>
            <div className={styles.log}>
                <h3>You can edit your</h3>
                <h3>profile here!</h3>
            </div>
            <div className={styles.container}>
                <form onSubmit={handleSubmit}>
                    <input
                        className={styles['input[type="text"]']}
                        type="text"
                        placeholder="Email"
                        name="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <h1 className={styles.line}>_____________________________________________</h1>
    
                    <input
                        className={styles['input[type="text"]']}
                        type="text"
                        placeholder="firstName"
                        name="firstName"
                        required
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                    />
                    <h1 className={styles.line}>_____________________________________________</h1>
    
                    <input
                        className={styles['input[type="text"]']}
                        type="text"
                        placeholder="lastName"
                        name="lastName"
                        required
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                    />
                    <h1 className={styles.line}>_____________________________________________</h1>
    
                    <input
                        className={styles['input[type="password"]']}
                        type="password"
                        placeholder="Password"
                        name="psw"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <h1 className={styles.line}>_____________________________________________</h1>
    
                    <input
                        className={styles['input[type="password"]']}
                        type="password"
                        placeholder="Confirm Password"
                        name="cpsw"
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                    />
                    <h1 className={styles.line}>_____________________________________________</h1>
    
                    <button className={styles.button} type="submit">Save changes</button>
                </form>
            </div>
            <Footer onLocationChange={()=>{}}/>
        </div>
    );

};


export default EditProfile;
