import { useState, useEffect } from 'react';
import '../app/globals.css';

type User = {
    _id: string;
    name: string;
    email: string;
    walletAddress?: string;
};

const UsersPage = () => {
    const [users, setUsers] = useState<User[]>([]); // Use User[] as the type for the users array
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        fetch('/api/users')
            .then((res) => res.json())
            .then((data) => setUsers(data.data || []));
    }, []);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent form from reloading the page

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email }),
            });

            if (response.ok) {
                const newUser = await response.json(); // Make sure `await` is used here to resolve the response
                setUsers([...users, newUser.data]); // Update users list with new user data
                setName('');
                setEmail('');
            } else {
                console.error('Failed to add user');
            }
        } catch (error) {
            console.error('Error while adding user:', error);
        }
    };


    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Users</h1>

            <form className="mb-6" onSubmit={handleAddUser}>
                <div>
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border p-2 mb-4 w-full"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border p-2 mb-4 w-full"
                    />
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                        Add User
                    </button>
                </div>
            </form>

            <h2 className="text-xl font-semibold mb-4">User List:</h2>
            <ul>
                {users.map((user) => (
                    <li key={user._id} className="border p-2 mb-2">
                        {user.name} - {user.email}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UsersPage;