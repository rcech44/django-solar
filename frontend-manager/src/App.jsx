import React from "react";
import Cookies from "universal-cookie";

const Menu = {
    Login: "login",
    Home: "home",
    Settings: "settings",
    Offer: "offer",
    Personal: "personal"
}

const cookies = new Cookies();

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state =
        {
            username: "",
            password: "",
            error: "",
            isAuthenticated: false,
            currentMenu: Menu.Login
        };
    }

    logged_in_user_info = {};

    componentDidMount = () => {
        this.getSession();
    }

    getSession = () => {
        fetch("/api/session/", {
            credentials: "same-origin",
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                if (data.isAuthenticated) {
                    this.setState({ isAuthenticated: true, currentMenu: Menu.Personal });
                    this.downloadCompanyInfo();
                }
                else {
                    this.setState({ isAuthenticated: false });
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    downloadCompanyInfo = () => {
        fetch("/api/infoMe/", {
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "same-origin",
        })
            .then((res) => res.json())
            .then((data) => {
                console.log('Logged in user: ');
                console.log(data);
                this.logged_in_user_info = data['user'];
                this.setCompanyDetailsOnPage();
            })
            .catch((err) => {
                console.log(err);
            });
    }

    updateCompanyInfo = () => {
        fetch("/api/updateMe/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": cookies.get("csrftoken"),
            },
            credentials: "same-origin",
            body: JSON.stringify({ 
                first_name: this.logged_in_user_info['first_name'], 
                last_name: this.logged_in_user_info['last_name'], 
                email: this.logged_in_user_info['email'], 
                company_name: this.logged_in_user_info['company_name'], 
                company_image: this.logged_in_user_info['company_image'] }),
        })
            .then(this.isResponseOk)
            .then((res) => {
                console.log("OK");
                this.setCompanyDetailsOnPage();
            })
            .catch((err) => {
                console.log(err);
            });
    }

    updateAndSavePersonalData = (event) => {
        event.preventDefault();
        this.logged_in_user_info['first_name'] = document.getElementById("firstName").value;
        this.logged_in_user_info['last_name'] = document.getElementById("lastName").value;
        this.logged_in_user_info['email'] = document.getElementById("email").value;
        this.logged_in_user_info['company_name'] = document.getElementById("company_name").value;
        this.logged_in_user_info['company_image'] = document.getElementById("company_image").value;
        this.updateCompanyInfo();
    }

    setCompanyDetailsOnPage = () => {

        // Header
        document.getElementById("header-company-name").innerHTML = this.logged_in_user_info['company_name'];

        // Page specific
        if (this.state.currentMenu == Menu.Personal)
        {
            document.getElementById("firstName").value = this.logged_in_user_info['first_name'];
            document.getElementById("lastName").value = this.logged_in_user_info['last_name'];
            document.getElementById("email").value = this.logged_in_user_info['email'];
            document.getElementById("company_name").value = this.logged_in_user_info['company_name'];
            document.getElementById("company_image").value = this.logged_in_user_info['company_image'];
            console.log('debug');
        }
        else if (this.state.currentMenu == Menu.Offer)
        {
            // this.setState({ currentMenu: Menu.Personal });
        }
        else if (this.state.currentMenu == Menu.Home)
        {
            // this.setState({ currentMenu: Menu.Home });
        }
    }

    handlePasswordChange = (event) => {
        this.setState({ password: event.target.value });
    }

    handleUserNameChange = (event) => {
        this.setState({ username: event.target.value });
    }

    isResponseOk(response) {
        if (response.status >= 200 && response.status <= 299) {
            return response.json();
        }
        else {
            throw Error(response.statusText);
        }
    }

    login = (event) => {
        event.preventDefault();
        fetch("/api/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": cookies.get("csrftoken"),
            },
            credentials: "same-origin",
            body: JSON.stringify({ username: this.state.username, password: this.state.password }),
        })
            .then(this.isResponseOk)
            .then((data) => {
                console.log(data);
                this.setState({ isAuthenticated: true, username: "", password: "", error: "", currentMenu: Menu.Personal });
                this.downloadCompanyInfo();
            })
            .catch((err) => {
                console.log(err);
                this.setState({ error: "Wrong username or password." });
            });
    }

    logout = () => {
        fetch("/api/logout", {
            credentials: "same-origin",
        })
            .then(this.isResponseOk)
            .then((data) => {
                console.log(data);
                this.setState({ isAuthenticated: false });
            })
            .catch((err) => {
                console.log(err);
            });
    }

    switchMenu(type) {
        console.log("Switching menu to: " + type);
        if (type == Menu.Personal)
        {
            this.setState({ currentMenu: Menu.Personal }, this.setCompanyDetailsOnPage);
        }
        else if (type == Menu.Offer)
        {
            this.setState({ currentMenu: Menu.Offer }, this.setCompanyDetailsOnPage);
        }
        else if (type == Menu.Home)
        {
            this.setState({ currentMenu: Menu.Home }, this.setCompanyDetailsOnPage);
        }
    }

    render() {

        // Show login screen if user is not authenticated
        if (!this.state.isAuthenticated) {
            return (
                <div className="container mt-3">
                    <h1>React Cookie Auth</h1>
                    <br />
                    <h2>Login</h2>
                    <form onSubmit={this.login}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input type="text" className="form-control" id="username" name="username" value={this.state.username} onChange={this.handleUserNameChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="username">Password</label>
                            <input type="password" className="form-control" id="password" name="password" value={this.state.password} onChange={this.handlePasswordChange} />
                            <div>
                                {this.state.error &&
                                    <small className="text-danger">
                                        {this.state.error}
                                    </small>
                                }
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary">Login</button>
                    </form>
                </div>
            );
        }

        // If user is authenticated - show his details
        else {

            // Main screen with offer details
            if (this.state.currentMenu == Menu.Personal) {
                return (
                    // <div className="container mt-3">
                    //   <h1>Správa profilu</h1>
                    //   <p>You are logged in!</p>
                    //   <button id="whoami_button" className="btn btn-primary mr-2" onClick={this.whoami}>WhoAmI</button>
                    //   <button className="btn btn-danger" onClick={this.logout}>Log out</button>
                    // </div>

                    // New content
                    <div>
                        <header id="header" className="p-3 mb-3 border-bottom">
                            <div className="container">
                                <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
                                    <a
                                        href="/"
                                        className="d-flex align-items-center mb-2 mb-lg-0 text-dark text-decoration-none"
                                    >
                                        <svg
                                            className="bi me-2"
                                            width={40}
                                            height={32}
                                            viewBox="0 0 24 24"
                                            role="img"
                                            aria-label="Bootstrap"
                                        >
                                            <path
                                                xmlns="http://www.w3.org/2000/svg"
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M9.83824 18.4467C10.0103 18.7692 10.1826 19.0598 10.3473 19.3173C8.59745 18.9238 7.07906 17.9187 6.02838 16.5383C6.72181 16.1478 7.60995 15.743 8.67766 15.4468C8.98112 16.637 9.40924 17.6423 9.83824 18.4467ZM11.1618 17.7408C10.7891 17.0421 10.4156 16.1695 10.1465 15.1356C10.7258 15.0496 11.3442 15 12.0001 15C12.6559 15 13.2743 15.0496 13.8535 15.1355C13.5844 16.1695 13.2109 17.0421 12.8382 17.7408C12.5394 18.3011 12.2417 18.7484 12 19.0757C11.7583 18.7484 11.4606 18.3011 11.1618 17.7408ZM9.75 12C9.75 12.5841 9.7893 13.1385 9.8586 13.6619C10.5269 13.5594 11.2414 13.5 12.0001 13.5C12.7587 13.5 13.4732 13.5593 14.1414 13.6619C14.2107 13.1384 14.25 12.5841 14.25 12C14.25 11.4159 14.2107 10.8616 14.1414 10.3381C13.4732 10.4406 12.7587 10.5 12.0001 10.5C11.2414 10.5 10.5269 10.4406 9.8586 10.3381C9.7893 10.8615 9.75 11.4159 9.75 12ZM8.38688 10.0288C8.29977 10.6478 8.25 11.3054 8.25 12C8.25 12.6946 8.29977 13.3522 8.38688 13.9712C7.11338 14.3131 6.05882 14.7952 5.24324 15.2591C4.76698 14.2736 4.5 13.168 4.5 12C4.5 10.832 4.76698 9.72644 5.24323 8.74088C6.05872 9.20472 7.1133 9.68686 8.38688 10.0288ZM10.1465 8.86445C10.7258 8.95042 11.3442 9 12.0001 9C12.6559 9 13.2743 8.95043 13.8535 8.86447C13.5844 7.83055 13.2109 6.95793 12.8382 6.2592C12.5394 5.69894 12.2417 5.25156 12 4.92432C11.7583 5.25156 11.4606 5.69894 11.1618 6.25918C10.7891 6.95791 10.4156 7.83053 10.1465 8.86445ZM15.6131 10.0289C15.7002 10.6479 15.75 11.3055 15.75 12C15.75 12.6946 15.7002 13.3521 15.6131 13.9711C16.8866 14.3131 17.9412 14.7952 18.7568 15.2591C19.233 14.2735 19.5 13.1679 19.5 12C19.5 10.8321 19.233 9.72647 18.7568 8.74093C17.9413 9.20477 16.8867 9.6869 15.6131 10.0289ZM17.9716 7.46178C17.2781 7.85231 16.39 8.25705 15.3224 8.55328C15.0189 7.36304 14.5908 6.35769 14.1618 5.55332C13.9897 5.23077 13.8174 4.94025 13.6527 4.6827C15.4026 5.07623 16.921 6.08136 17.9716 7.46178ZM8.67765 8.55325C7.61001 8.25701 6.7219 7.85227 6.02839 7.46173C7.07906 6.08134 8.59745 5.07623 10.3472 4.6827C10.1826 4.94025 10.0103 5.23076 9.83823 5.5533C9.40924 6.35767 8.98112 7.36301 8.67765 8.55325ZM15.3224 15.4467C15.0189 16.637 14.5908 17.6423 14.1618 18.4467C13.9897 18.7692 13.8174 19.0598 13.6527 19.3173C15.4026 18.9238 16.921 17.9186 17.9717 16.5382C17.2782 16.1477 16.3901 15.743 15.3224 15.4467ZM12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                                                fill="#000000"
                                            />
                                        </svg>
                                    </a>
                                    <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
                                        <li>
                                            <a onClick={() => this.switchMenu(Menu.Personal)} className="nav-link px-2 link-secondary">
                                                O firmě
                                            </a>
                                        </li>
                                        <li>
                                            <a onClick={() => this.switchMenu(Menu.Offer)} className="nav-link px-2 link-dark">
                                                Nabídka
                                            </a>
                                        </li>
                                    </ul>
                                    <p
                                        id="header-company-name"
                                        className="col-12 col-lg-auto mb-3 mb-lg-0 me-lg-3"
                                    ></p>
                                    <div className="dropdown text-end">
                                        <a
                                            href="#"
                                            className="d-block link-dark text-decoration-none dropdown-toggle"
                                            id="dropdownUser1"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                        >
                                            <img
                                                src="https://github.com/mdo.png"
                                                alt="mdo"
                                                width={32}
                                                height={32}
                                                className="rounded-circle"
                                            />
                                        </a>
                                        <ul
                                            className="dropdown-menu text-small"
                                            aria-labelledby="dropdownUser1"
                                        >
                                            <li>
                                                <a id="signout-button" className="dropdown-item" onClick={this.logout}>
                                                    Odhlásit se
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </header>


                        <div className="container">
                            <div className="py-5 text-center">
                                <img
                                    className="d-block mx-auto mb-4"
                                    src="https://getbootstrap.com/docs/4.0/assets/brand/bootstrap-solid.svg"
                                    alt=""
                                    width={72}
                                    height={72}
                                />
                                <h2>Checkout form</h2>
                                <p className="lead">
                                    Below is an example form built entirely with Bootstrap's form controls.
                                    Each required form group has a validation state that can be triggered by
                                    attempting to submit the form without completing it.
                                </p>
                            </div>
                            <div className="row">
                                <div className="col-md-12 order-md-1">
                                    <h4 className="mb-3">Kontaktní údaje</h4>
                                    <form className="needs-validation" noValidate="">
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="firstName">Jméno</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="firstName"
                                                    placeholder=""
                                                    defaultValue=""
                                                    required=""
                                                />
                                                <div className="invalid-feedback">
                                                    Valid first name is required.
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="lastName">Příjmení</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="lastName"
                                                    placeholder=""
                                                    defaultValue=""
                                                    required=""
                                                />
                                                <div className="invalid-feedback">Valid last name is required.</div>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="email">
                                                Kontaktní email <span className="text-muted">(pro případ ...)</span>
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="email"
                                                placeholder="you@example.com"
                                            />
                                            <div className="invalid-feedback">
                                                Please enter a valid email address for shipping updates.
                                            </div>
                                        </div>
                                        
                                        <hr className="mb-4" />
                                        <h4 className="mb-3">O firmě</h4>
                                        <div className="mb-3">
                                            <label htmlFor="company_name">
                                                Celý název firmy
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="company_name"
                                                placeholder="Firma s.r.o."
                                            />
                                            <small className="text-muted">Toto jméno se bude zobrazovat ve výsledcích srovnávače</small>
                                            <div className="invalid-feedback">
                                                Please enter a valid name.
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="company_image">
                                                Odkaz na logo firmy
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="company_image"
                                                placeholder="https://..."
                                            />
                                            <small className="text-muted">Logo se také bude zobrazovat ve výsledcích, zadejte platné URL</small>
                                            <div className="invalid-feedback">
                                                Please enter a valid image url.
                                            </div>
                                        </div>
                                        <hr className="mb-4" />
                                        <button className="btn btn-primary btn-lg btn-block" onClick={this.updateAndSavePersonalData}>
                                            Uložit změny
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            else if (this.state.currentMenu == Menu.Offer)
            {
                return (
                    // <div className="container mt-3">
                    //   <h1>Správa profilu</h1>
                    //   <p>You are logged in!</p>
                    //   <button id="whoami_button" className="btn btn-primary mr-2" onClick={this.whoami}>WhoAmI</button>
                    //   <button className="btn btn-danger" onClick={this.logout}>Log out</button>
                    // </div>

                    // New content
                    <div>
                        <header id="header" className="p-3 mb-3 border-bottom">
                            <div className="container">
                                <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
                                    <a
                                        href="/"
                                        className="d-flex align-items-center mb-2 mb-lg-0 text-dark text-decoration-none"
                                    >
                                        <svg
                                            className="bi me-2"
                                            width={40}
                                            height={32}
                                            viewBox="0 0 24 24"
                                            role="img"
                                            aria-label="Bootstrap"
                                        >
                                            <path
                                                xmlns="http://www.w3.org/2000/svg"
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M9.83824 18.4467C10.0103 18.7692 10.1826 19.0598 10.3473 19.3173C8.59745 18.9238 7.07906 17.9187 6.02838 16.5383C6.72181 16.1478 7.60995 15.743 8.67766 15.4468C8.98112 16.637 9.40924 17.6423 9.83824 18.4467ZM11.1618 17.7408C10.7891 17.0421 10.4156 16.1695 10.1465 15.1356C10.7258 15.0496 11.3442 15 12.0001 15C12.6559 15 13.2743 15.0496 13.8535 15.1355C13.5844 16.1695 13.2109 17.0421 12.8382 17.7408C12.5394 18.3011 12.2417 18.7484 12 19.0757C11.7583 18.7484 11.4606 18.3011 11.1618 17.7408ZM9.75 12C9.75 12.5841 9.7893 13.1385 9.8586 13.6619C10.5269 13.5594 11.2414 13.5 12.0001 13.5C12.7587 13.5 13.4732 13.5593 14.1414 13.6619C14.2107 13.1384 14.25 12.5841 14.25 12C14.25 11.4159 14.2107 10.8616 14.1414 10.3381C13.4732 10.4406 12.7587 10.5 12.0001 10.5C11.2414 10.5 10.5269 10.4406 9.8586 10.3381C9.7893 10.8615 9.75 11.4159 9.75 12ZM8.38688 10.0288C8.29977 10.6478 8.25 11.3054 8.25 12C8.25 12.6946 8.29977 13.3522 8.38688 13.9712C7.11338 14.3131 6.05882 14.7952 5.24324 15.2591C4.76698 14.2736 4.5 13.168 4.5 12C4.5 10.832 4.76698 9.72644 5.24323 8.74088C6.05872 9.20472 7.1133 9.68686 8.38688 10.0288ZM10.1465 8.86445C10.7258 8.95042 11.3442 9 12.0001 9C12.6559 9 13.2743 8.95043 13.8535 8.86447C13.5844 7.83055 13.2109 6.95793 12.8382 6.2592C12.5394 5.69894 12.2417 5.25156 12 4.92432C11.7583 5.25156 11.4606 5.69894 11.1618 6.25918C10.7891 6.95791 10.4156 7.83053 10.1465 8.86445ZM15.6131 10.0289C15.7002 10.6479 15.75 11.3055 15.75 12C15.75 12.6946 15.7002 13.3521 15.6131 13.9711C16.8866 14.3131 17.9412 14.7952 18.7568 15.2591C19.233 14.2735 19.5 13.1679 19.5 12C19.5 10.8321 19.233 9.72647 18.7568 8.74093C17.9413 9.20477 16.8867 9.6869 15.6131 10.0289ZM17.9716 7.46178C17.2781 7.85231 16.39 8.25705 15.3224 8.55328C15.0189 7.36304 14.5908 6.35769 14.1618 5.55332C13.9897 5.23077 13.8174 4.94025 13.6527 4.6827C15.4026 5.07623 16.921 6.08136 17.9716 7.46178ZM8.67765 8.55325C7.61001 8.25701 6.7219 7.85227 6.02839 7.46173C7.07906 6.08134 8.59745 5.07623 10.3472 4.6827C10.1826 4.94025 10.0103 5.23076 9.83823 5.5533C9.40924 6.35767 8.98112 7.36301 8.67765 8.55325ZM15.3224 15.4467C15.0189 16.637 14.5908 17.6423 14.1618 18.4467C13.9897 18.7692 13.8174 19.0598 13.6527 19.3173C15.4026 18.9238 16.921 17.9186 17.9717 16.5382C17.2782 16.1477 16.3901 15.743 15.3224 15.4467ZM12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                                                fill="#000000"
                                            />
                                        </svg>
                                    </a>
                                    <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
                                    <li>
                                            <a onClick={() => this.switchMenu(Menu.Personal)} className="nav-link px-2 link-secondary">
                                                O firmě
                                            </a>
                                        </li>
                                        <li>
                                            <a onClick={() => this.switchMenu(Menu.Offer)} className="nav-link px-2 link-dark">
                                                Nabídka
                                            </a>
                                        </li>
                                    </ul>
                                    <p
                                        id="header-company-name"
                                        className="col-12 col-lg-auto mb-3 mb-lg-0 me-lg-3"
                                    ></p>
                                    <div className="dropdown text-end">
                                        <a
                                            href="#"
                                            className="d-block link-dark text-decoration-none dropdown-toggle"
                                            id="dropdownUser1"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                        >
                                            <img
                                                src="https://github.com/mdo.png"
                                                alt="mdo"
                                                width={32}
                                                height={32}
                                                className="rounded-circle"
                                            />
                                        </a>
                                        <ul
                                            className="dropdown-menu text-small"
                                            aria-labelledby="dropdownUser1"
                                        >
                                            <li>
                                                <a id="signout-button" className="dropdown-item" onClick={this.logout}>
                                                    Odhlásit se
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </header>


                        <div className="container">
                            <div className="py-5 text-center">
                                <img
                                    className="d-block mx-auto mb-4"
                                    src="https://getbootstrap.com/docs/4.0/assets/brand/bootstrap-solid.svg"
                                    alt=""
                                    width={72}
                                    height={72}
                                />
                                <h2>Checkout form</h2>
                                <p className="lead">
                                    Below is an example form built entirely with Bootstrap's form controls.
                                    Each required form group has a validation state that can be triggered by
                                    attempting to submit the form without completing it.
                                </p>
                            </div>
                            <div className="row">
                                <div className="col-md-4 order-md-2 mb-4">
                                    <h4 className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="text-muted">Your cart</span>
                                        <span className="badge badge-secondary badge-pill">3</span>
                                    </h4>
                                    <ul className="list-group mb-3">
                                        <li className="list-group-item d-flex justify-content-between lh-condensed">
                                            <div>
                                                <h6 className="my-0">Product name</h6>
                                                <small className="text-muted">Brief description</small>
                                            </div>
                                            <span className="text-muted">$12</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between lh-condensed">
                                            <div>
                                                <h6 className="my-0">Second product</h6>
                                                <small className="text-muted">Brief description</small>
                                            </div>
                                            <span className="text-muted">$8</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between lh-condensed">
                                            <div>
                                                <h6 className="my-0">Third item</h6>
                                                <small className="text-muted">Brief description</small>
                                            </div>
                                            <span className="text-muted">$5</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between bg-light">
                                            <div className="text-success">
                                                <h6 className="my-0">Promo code</h6>
                                                <small>EXAMPLECODE</small>
                                            </div>
                                            <span className="text-success">-$5</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>Total (USD)</span>
                                            <strong>$20</strong>
                                        </li>
                                    </ul>
                                    <form className="card p-2">
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Promo code"
                                            />
                                            <div className="input-group-append">
                                                <button type="submit" className="btn btn-secondary">
                                                    Redeem
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div className="col-md-8 order-md-1">
                                    <h4 className="mb-3">Billing address</h4>
                                    <form className="needs-validation" noValidate="">
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="firstName">First name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="firstName"
                                                    placeholder=""
                                                    defaultValue=""
                                                    required=""
                                                />
                                                <div className="invalid-feedback">
                                                    Valid first name is required.
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="lastName">Last name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="lastName"
                                                    placeholder=""
                                                    defaultValue=""
                                                    required=""
                                                />
                                                <div className="invalid-feedback">Valid last name is required.</div>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="username">Username</label>
                                            <div className="input-group">
                                                <div className="input-group-prepend">
                                                    <span className="input-group-text">@</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="username"
                                                    placeholder="Username"
                                                    required=""
                                                />
                                                <div className="invalid-feedback" style={{ width: "100%" }}>
                                                    Your username is required.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="email">
                                                Email <span className="text-muted">(Optional)</span>
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="email"
                                                placeholder="you@example.com"
                                            />
                                            <div className="invalid-feedback">
                                                Please enter a valid email address for shipping updates.
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="address">Address</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="address"
                                                placeholder="1234 Main St"
                                                required=""
                                            />
                                            <div className="invalid-feedback">
                                                Please enter your shipping address.
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="address2">
                                                Address 2 <span className="text-muted">(Optional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="address2"
                                                placeholder="Apartment or suite"
                                            />
                                        </div>
                                        <div className="row">
                                            <div className="col-md-5 mb-3">
                                                <label htmlFor="country">Country</label>
                                                <select
                                                    className="custom-select d-block w-100"
                                                    id="country"
                                                    required=""
                                                >
                                                    <option value="">Choose...</option>
                                                    <option>United States</option>
                                                </select>
                                                <div className="invalid-feedback">
                                                    Please select a valid country.
                                                </div>
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label htmlFor="state">State</label>
                                                <select
                                                    className="custom-select d-block w-100"
                                                    id="state"
                                                    required=""
                                                >
                                                    <option value="">Choose...</option>
                                                    <option>California</option>
                                                </select>
                                                <div className="invalid-feedback">
                                                    Please provide a valid state.
                                                </div>
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <label htmlFor="zip">Zip</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="zip"
                                                    placeholder=""
                                                    required=""
                                                />
                                                <div className="invalid-feedback">Zip code required.</div>
                                            </div>
                                        </div>
                                        <hr className="mb-4" />
                                        <div className="custom-control custom-checkbox">
                                            <input
                                                type="checkbox"
                                                className="custom-control-input"
                                                id="same-address"
                                            />
                                            <label className="custom-control-label" htmlFor="same-address">
                                                Shipping address is the same as my billing address
                                            </label>
                                        </div>
                                        <div className="custom-control custom-checkbox">
                                            <input
                                                type="checkbox"
                                                className="custom-control-input"
                                                id="save-info"
                                            />
                                            <label className="custom-control-label" htmlFor="save-info">
                                                Save this information for next time
                                            </label>
                                        </div>
                                        <hr className="mb-4" />
                                        <h4 className="mb-3">Payment</h4>
                                        <div className="d-block my-3">
                                            <div className="custom-control custom-radio">
                                                <input
                                                    id="credit"
                                                    name="paymentMethod"
                                                    type="radio"
                                                    className="custom-control-input"
                                                    defaultChecked=""
                                                    required=""
                                                />
                                                <label className="custom-control-label" htmlFor="credit">
                                                    Credit card
                                                </label>
                                            </div>
                                            <div className="custom-control custom-radio">
                                                <input
                                                    id="debit"
                                                    name="paymentMethod"
                                                    type="radio"
                                                    className="custom-control-input"
                                                    required=""
                                                />
                                                <label className="custom-control-label" htmlFor="debit">
                                                    Debit card
                                                </label>
                                            </div>
                                            <div className="custom-control custom-radio">
                                                <input
                                                    id="paypal"
                                                    name="paymentMethod"
                                                    type="radio"
                                                    className="custom-control-input"
                                                    required=""
                                                />
                                                <label className="custom-control-label" htmlFor="paypal">
                                                    Paypal
                                                </label>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="cc-name">Name on card</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="cc-name"
                                                    placeholder=""
                                                    required=""
                                                />
                                                <small className="text-muted">Full name as displayed on card</small>
                                                <div className="invalid-feedback">Name on card is required</div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="cc-number">Credit card number</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="cc-number"
                                                    placeholder=""
                                                    required=""
                                                />
                                                <div className="invalid-feedback">
                                                    Credit card number is required
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-3 mb-3">
                                                <label htmlFor="cc-expiration">Expiration</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="cc-expiration"
                                                    placeholder=""
                                                    required=""
                                                />
                                                <div className="invalid-feedback">Expiration date required</div>
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <label htmlFor="cc-expiration">CVV</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="cc-cvv"
                                                    placeholder=""
                                                    required=""
                                                />
                                                <div className="invalid-feedback">Security code required</div>
                                            </div>
                                        </div>
                                        <hr className="mb-4" />
                                        <button className="btn btn-primary btn-lg btn-block" type="submit">
                                            Continue to checkout
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        }
    }
}

export default App;