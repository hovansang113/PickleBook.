import {NavLink} from "react-router-dom";

export default function Footer() {
    return(
        <footer className= "flex items-center justify-between border-t border-outline px-8 py-4">
            <span className= "font-headline text-xl  text-primary">
                SangPickle
            </span>
            <nav className= "flex items-center gap-4">
                <NavLink className= "text-neutral-600" to="/PrivacyPolicy">
                    Privacy Policy
                </NavLink>
                <NavLink className= "text-neutral-600" to="/TermsOfService">
                    Terms of Service
                </NavLink>
                <NavLink className= "text-neutral-600" to="/CourtRules">
                    Court Rules
                </NavLink>
                <NavLink className= "text-neutral-600" to="/ContactUs">
                    Contact Us
                </NavLink>
            </nav>
            <span className= "text-neutral-600">
                &copy; 2026 SangPickle. All rights reserved.
            </span>
        </footer>
    )
}