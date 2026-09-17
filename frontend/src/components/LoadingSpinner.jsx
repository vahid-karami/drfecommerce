export default function LoadingSpinner({ message }) {
  return (
    <div className="loading">
      <div className="spinner-container">
        <div className="spinner" />
        {message && <p className="loading-message">{message}</p>}
      </div>
    </div>
  );
}
