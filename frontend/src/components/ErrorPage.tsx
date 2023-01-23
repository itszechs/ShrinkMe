import './ErrorPage.css'

export default function ErrorPage() {
  return (
    <div className="error-page">
        <span className='header'>404</span>
        <span className='content'>Not Found</span>
        <span className='description'>The resource requested could not be found on this server</span>
    </div>
  );
}
