import './styles.sass'

// Registrar la imagen para guardarla en mongoDB

const Register = () => {
    return (
        <div className="register">
            <h1>Register</h1>
            <form>
                <input type="file" />
                <button>Register</button>
            </form>
        </div>
    )
}

export default Register
