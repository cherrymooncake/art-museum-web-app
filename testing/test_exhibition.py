import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import UnexpectedAlertPresentException

EXHIBITIONS_URL = "http://localhost:3000/admin/exhibitions"  
def admin_login(driver):
    driver.get("http://localhost:3000/auth/login")
    driver.find_element(By.NAME, "email").send_keys("admin@example.com")
    driver.find_element(By.NAME, "password").send_keys("adminpassword")
    driver.find_element(By.CSS_SELECTOR, "button[type=submit]").click()

@pytest.mark.usefixtures("driver")  
def test_create_exhibition(driver):
    admin_login(driver)
    driver.get(EXHIBITIONS_URL)
    wait = WebDriverWait(driver, 10)

    try:
        wait.until(EC.text_to_be_present_in_element((By.TAG_NAME, "body"), "Управление выставками"))
    except UnexpectedAlertPresentException:
        alert = driver.switch_to.alert
        print(f"Alert text during test: {alert.text}")
        alert.accept()
         
        wait.until(EC.text_to_be_present_in_element((By.TAG_NAME, "body"), "Управление выставками"))

     
    assert "Управление выставками" in driver.page_source
