import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

BASE_URL = "http://localhost:3000"
LOGIN_URL = f"{BASE_URL}/auth/login"
EXHIBITIONS_URL = f"{BASE_URL}/admin/exhibitions"

ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "password123" 

@pytest.fixture(scope="module")
def driver():
    options = Options()
    options.add_argument("--headless")
    driver = webdriver.Chrome(options=options)
    yield driver
    driver.quit()
def test_admin_authentication(driver):
    driver.get(LOGIN_URL)

    wait = WebDriverWait(driver, 10)

    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'input[placeholder="Email"]')))
    driver.find_element(By.CSS_SELECTOR, 'input[placeholder="Email"]').send_keys(ADMIN_EMAIL)
    driver.find_element(By.CSS_SELECTOR, 'input[placeholder="Пароль"]').send_keys(ADMIN_PASSWORD)

    driver.find_element(By.XPATH, "//button[contains(text(), 'Войти')]").click()

    try:
        wait.until(EC.invisibility_of_element_located((By.CSS_SELECTOR, 'input[placeholder="Email"]')))
    except:
        print("Логин не удался. Текущий URL:", driver.current_url)
        print("Текст страницы:", driver.page_source[:1000])
        assert False, "Форма логина не исчезла — возможно, неверный логин или пароль"

    driver.get(EXHIBITIONS_URL)
    wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    assert "Управление выставками" in driver.page_source