from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

options = Options()
options.add_argument("--headless")  # без GUI
driver = webdriver.Chrome(options=options)
wait = WebDriverWait(driver, 10)

BASE_URL = "http://localhost:3000"

def test_home_page_loads():
    driver.get(BASE_URL)
    assert "Добро пожаловать в Художественный Музей" in driver.page_source
    print("Главная страница загружается")

def test_artworks_page_and_category_filter():
    driver.get(f"{BASE_URL}/artworks")

    wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
    assert "Экспонаты" in driver.page_source

    category_select = driver.find_element(By.CSS_SELECTOR, "select:nth-of-type(1)")
    category_select.click()
    time.sleep(1)

    options = category_select.find_elements(By.TAG_NAME, "option")
    if len(options) > 1:
        options[1].click() 
        time.sleep(2)

        assert "Нет экспонатов" not in driver.page_source
        print("Фильтрация по категории на странице экспонатов работает")
    else:
        print("Недостаточно категорий для проверки фильтрации")

if __name__ == "__main__":
    try:
        test_home_page_loads()
        test_artworks_page_and_category_filter()
    finally:
        driver.quit()
