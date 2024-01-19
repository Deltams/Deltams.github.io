import './App.css';
import React, { useEffect, useState } from "react";
import { Container, Navbar, NavbarBrand, Nav, Button } from "react-bootstrap";
import logo from "./logo.svg";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Documentation from "./pages/Documentation";
import LiquidityPool from "./pages/LiquidityPool";
import RiskManager from "./pages/RiskManager";
import TraderAccount from "./pages/TraderAccount";
import Test from "./pages/TESTPANEL";

function App() {
  document.body.style.overflow = 'hidden'; // Отключает прокрутку страницы для пользователей

  const [userAccount, setUserAccount] = useState("");

  async function onConnect() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setUserAccount(accounts[0]);
      } catch (error) {
        console.log("Error connecting...");
      }
    } else {
      alert("Установите MetaMask");
    }
  }

  function demonstrationWallet(strWallet) {
    let answer = "";
    for (let i = 0; i < 6; i++) {
      answer += strWallet[i];
    }
    answer += " . . . ";
    for (let i = strWallet.length-6; i < strWallet.length; i++) {
      answer += strWallet[i];
    }
    return answer;
  }

  useEffect(() => {
    (async () => {
      if (window.ethereum) {
        await onConnect();
        //const provider = new ethers.BrowserProvider(window.ethereum);
        
      }
    })();
  }, []);

  return (
    <div>
      <Navbar fixed="top" collapseOnSelect expand="md" bg="dark" variant="dark">
          <Container>
              <NavbarBrand href="/">
                  <img
                      src={logo}
                      height="30"
                      width="30"
                      className="d-inline-block align-top"
                      alt="Logo"
                  /> Margin Trading
              </NavbarBrand>
              <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
              <Navbar.Collapse id="responsive-navbar-nav">
                  <Nav className="mr-auto">
                      <Nav.Link href='/liquidityPool'>Liquidity pool</Nav.Link>
                  </Nav>
                  <Nav className="mr-auto">
                      <Nav.Link href='/traderAccount'>Trader account</Nav.Link>
                  </Nav>
                  <Nav className="mr-auto">
                      <Nav.Link href='/riskManager'>Risk manager</Nav.Link>
                  </Nav>
                  <Nav className="mr-auto">
                      <Nav.Link href='/documentation'>Documentation </Nav.Link>
                  </Nav>
                  <Nav className="mr-auto">
                      <Nav.Link href='/test'>TEST</Nav.Link>
                  </Nav>
              </Navbar.Collapse>
              <Navbar.Collapse className="justify-content-end">
                  {userAccount === "" ? (<Button onClick={onConnect} variant="outline-light">Wallet Connection</Button>) : (<Button onClick={onConnect} variant="outline-light">{demonstrationWallet(userAccount)}</Button>)}
              </Navbar.Collapse>
          </Container>
      </Navbar>
      
      <Router>
          <Routes>
              {/* <Route exact path='/liquidityPool' element={(props) => <LiquidityPool {...props} userAccount={userAccount}/>} /> */}
              <Route exact path='/liquidityPool' element={<LiquidityPool/>} />
              <Route exact path='/traderAccount' element={<TraderAccount/>} />
              <Route exact path='/riskManager' element={<RiskManager/>} />
              <Route exact path='/documentation' element={<Documentation/>} />
              <Route exact path='/test' element={<Test/>} />
          </Routes>
      </Router>
    </div>
  );
}

export default App;
