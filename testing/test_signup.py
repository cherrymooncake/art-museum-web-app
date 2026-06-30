import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

@pytest.fixture(scope="session")
def driver():
    options = Options()
    # options.add_argument("--headless")   
    driver = webdriver.Chrome(options=options)
    yield driver
    driver.quit()

BASE_URL = "http://localhost:3000"
SIGNUP_URL = f"{BASE_URL}/auth/signup"

@pytest.mark.usefixtures("driver")
def test_user_registration(driver):
    driver.get(SIGNUP_URL)
    wait = WebDriverWait(driver, 10)

     
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'input[name="name"]')))

     
    timestamp = int(time.time())
    name = "TestUse"
    email = "testuser@example.com"
    password = "TestPassword123"
    gender = "Мужской"

    driver.find_element(By.CSS_SELECTOR, 'input[name="name"]').send_keys(name)
    driver.find_element(By.CSS_SELECTOR, 'input[name="email"]').send_keys(email)
    driver.find_element(By.CSS_SELECTOR, 'input[name="password"]').send_keys(password)

    select_gender = driver.find_element(By.CSS_SELECTOR, 'select[name="gender"]')
    for option in select_gender.find_elements(By.TAG_NAME, 'option'):
        if option.get_attribute("value") == gender:
            option.click()
            break

     
    driver.find_element(By.XPATH, "//button[contains(text(), 'Зарегистрироваться')]").click()

    
    wait.until(EC.url_to_be(BASE_URL + "/"))

     
    token = driver.execute_script("return window.localStorage.getItem('token');")
    assert token is not None and len(token) > 0, "Токен не сохранён в localStorage"

     
    assert "Добро пожаловать" in driver.page_source or "Welcome" in driver.page_source
