export default function LoginPage() {
  return (
    <div>
      <h1>Login</h1>
      <form action="/api/login" method="POST">
        <input type="email" name="email" placeholder="Email" required />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
