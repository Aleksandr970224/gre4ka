const swiper = new Swiper('.swiper', {
  direction: 'horizontal',
  loop: true,
  speed: 2000,
  effect: "slide", //???
  allowTouchMove: false,

  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },

});


//Стрелки слайдера, ховер

//Состояние, когда мышь на стрелке
let arrowSlider = document.querySelectorAll('.swiper-button-next, .swiper-button-prev');
arrowSlider.forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (el.classList.contains('swiper-button-prev')) {
      document.querySelector('.first-prev').classList.remove('active')
      document.querySelector('.second-prev').classList.add('active')
    } else {
      document.querySelector('.first-next').classList.remove('active')
      document.querySelector('.second-next').classList.add('active')
    }
  })
})

//Состояние, когда мышь не на стрелке
arrowSlider.forEach(el => {
  el.addEventListener('mouseleave', () => {
    if (el.classList.contains('swiper-button-prev')) {
      document.querySelector('.first-prev').classList.add('active')
      document.querySelector('.second-prev').classList.remove('active')
    } else {
      document.querySelector('.first-next').classList.add('active')
      document.querySelector('.second-next').classList.remove('active')
    }
  })
})

//Обрезаем стрелки под мобильную версию
let changeArrowSize = () => {
  if (window.innerWidth < 376) {
    document.querySelector('.first-prev defs linearGradient').setAttribute('x1', '60');
    document.querySelector('.second-prev defs linearGradient').setAttribute('x1', '90');
    document.querySelector('.first-next defs linearGradient').setAttribute('x1', '90');
    document.querySelector('.second-next defs linearGradient').setAttribute('x1', '90');

    //Смена скорости слайдера
    swiper.params.speed = 1000;
    swiper.update();
  } else {
    document.querySelector('.first-prev defs linearGradient').setAttribute('x1', '152');
    document.querySelector('.second-prev defs linearGradient').setAttribute('x1', '0');
    document.querySelector('.first-next defs linearGradient').setAttribute('x1', '0');
    document.querySelector('.second-next defs linearGradient').setAttribute('x1', '0');

    //Смена скорости слайдера
    swiper.params.speed = 2000;
    swiper.update();
  }
}
window.addEventListener('resize', () => {
  changeArrowSize();
})



//Слайдер 
const slidesUrlFirst = fetch('http://localhost:3000/offset0');
const slidesUrlSecond = fetch('http://localhost:3000/offset3');
const slidesUrlThird = fetch('http://localhost:3000/offset6');
const slidesUrlAll = fetch('http://localhost:3000/data');


let sliderCollection = document.querySelectorAll('.swiper-slide img');
let sliderDiv = document.getElementsByClassName('swiper-slide');


//Функция загрузки остальных изображений с БД
const getSlidesUrl = (slidesUrl) => {
  slidesUrl.then(resp => {
    if (!resp.ok) {
      throw new Error(`er: ${resp.status}`)
    };
    return resp.json();
  }).then(data => {
    data.forEach(el => {
      swiper.appendSlide([
        `<div class="swiper-slide">
          <img src='${el.imgUrl}' alt='img'>
        </div>`
      ])
    });
  })
    .catch(e => {
      console.error(e);
      document.querySelector('.swiper-button-next').style.pointerEvents = 'none'
      document.querySelector('.swiper-button-prev').style.pointerEvents = 'none'
      document.querySelectorAll('.swiper-slide').forEach(el => {
        el.style.display = 'none';
      })
      document.querySelector('.swiper-slide.error').style.display = 'flex';
    });
};



//Первые три изображения
window.onload = () => {
  slidesUrlFirst.then(resp => {
    if (!resp.ok) {
      throw new Error(`error: ${resp.status}`)
    };
    return resp.json()
  }).then(data => {
    for (let i = 0; i < sliderCollection.length; i++) {
      sliderCollection[i].src = data[i].imgUrl;
    };

    swiper.on('slideChange', function () {

      const isFirstSlide = swiper.isBeginning;
      const isLastSlide = swiper.isEnd;

      //Глушим стрелки, в зависимости от слайдов
      if (isFirstSlide) {
        arrowSlider[0].classList.add('swiper-button-disabled');
      } else {
        arrowSlider[0].classList.remove('swiper-button-disabled');
      }

      if (isLastSlide) {
        arrowSlider[1].classList.add('swiper-button-disabled');
      } else {
        arrowSlider[1].classList.remove('swiper-button-disabled');
      }

      //Добавляем слайды
      if (isLastSlide) {
        if (swiper.activeIndex === 2) {
          getSlidesUrl(slidesUrlSecond);
        } else if (swiper.activeIndex === 5) {
          getSlidesUrl(slidesUrlThird);
        }
      }
    });
  })
    .catch(e => {
      console.error(e);
      arrowSlider.forEach(el => el.style.pointerEvents = 'none')
      document.querySelectorAll('.swiper-slide').forEach(el => {
        el.style.display = 'none';
      })
      document.querySelector('.swiper-slide.error').style.display = 'flex';
    });

  changeArrowSize();
};

// Меняем контент на слайдах
slidesUrlAll.then(resp => resp.json())
  .then(data => {
    countLike.innerHTML = data[0].likeCnt


    //Делаем get-запрос для проверки состояния лайка
    fetch(`http://localhost:3000/${swiper.activeIndex}`)
      .then(resp => {
        if (!resp.ok) {
          throw new Error('error')
        }
        return resp.json()
      })
      .then(like => {
        if (like.likeCnt) {
          countLike.innerHTML = like.likeCnt;
        }

        if (like.liked) {
          document.querySelector('.footer__wrapper__like svg').classList.add('active');
          document.querySelector('.footer__wrapper__like svg').style.pointerEvents = 'none';
        }
      })
      .catch(e => {
        console.error(e);
      })


    swiper.on('slideChange', () => {
      const isFirstSlide = swiper.isBeginning;
      const initialState = {
        id: 'The Razorite',
        desc: 'BMW i8 concept supported by Alpine Yokohama',
        likeCnt: data[0].likeCnt
      }

      document.querySelector('.header__title').innerHTML = `0${data[swiper.activeIndex].id + 1}`;
      document.querySelector('.main__text').innerHTML = data[swiper.activeIndex].desc;

      countLike.innerHTML = data[swiper.activeIndex].likeCnt;

      if (isFirstSlide) {
        document.querySelector('.header__title').innerHTML = initialState.id;
        document.querySelector('.main__text').innerHTML = initialState.desc;
      }

      //Делаем get-запрос для проверки состояния лайка, при смене слайдов
      fetch(`http://localhost:3000/${swiper.activeIndex}`)
        .then(resp => {
          if (!resp.ok) {
            throw new Error('error');
          }
          return resp.json()
        })
        .then(like => {
          if (like.likeCnt) {
            countLike.innerHTML = like.likeCnt;
          }

          if (like.liked) {
            document.querySelector('.footer__wrapper__like svg').classList.add('active');
            document.querySelector('.footer__wrapper__like svg').style.pointerEvents = 'none';
          }
        })
        .catch(e => {
          console.error(e);
        })

      //Скрываем текст описания
      let textDesc = document.querySelector('.main__text');
      if (textDesc.classList.contains('hidden')) {
        textDesc.classList.remove('hidden')
        if (textDesc.clientHeight > 143) {
          textDesc.classList.add('hidden')
        }
      } else {
        textDesc.classList.add('hidden')
      }

      //Снимаем с  лайка активное состояние
      if (document.querySelector('.footer__wrapper__like svg').classList.contains('active')) {
        document.querySelector('.footer__wrapper__like svg').classList.remove('active');
        document.querySelector('.footer__wrapper__like svg').style.pointerEvents = 'auto';
      }
    })
  });

// //Popup, лайк
let btnLike = document.querySelector('.footer__wrapper__like svg');
let countLike = document.querySelector('.wrapper__like__text__like b');
let popupWindow = document.querySelector('.popup__window');
let btnClosePopup = document.querySelector('.popup-window__wrapper-content button');
let closePopup = () => popupWindow.classList.remove('active');



btnLike.addEventListener('click', () => {
  const activeSlide = swiper.activeIndex;
  const urlLike = `http://localhost:3000/${activeSlide}`;

  countLike.innerHTML++;

  document.querySelector('.footer__wrapper__like svg').classList.add('active');
  document.querySelector('.footer__wrapper__like svg').style.pointerEvents = 'none';
  popupWindow.classList.add('active');
  document.querySelector('body').classList.add('active')
  document.querySelector('.popup-window__wrapper-content').style.transform = 'translateY(0)';

  //Post-запрос, добавляем лайк и его активное состояние
  fetch(urlLike).then(response => {
    if (!response.ok) {
      throw new Error('Not 200');
    }
    return response.json();
  })
    .then(existingData => {

      const newData = {
        likeCnt: `${countLike.innerHTML}`,
        liked: true,
        ...existingData
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData)
      };

      return fetch(urlLike, options);
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.error('Error', error);
      document.querySelector('.popup-window__wrapper-content').classList.add('error')
      document.querySelector('.popup-window__wrapper-content p').innerHTML = 'ERROR'
    });
});

//Закрываем popup
btnClosePopup.addEventListener('click', () => {
  document.querySelector('body').classList.remove('active')
  document.querySelector('.popup-window__wrapper-content').style.transform = 'translateY(200%)';
  setTimeout(closePopup, 500);
});

//Закрываем popup
popupWindow.addEventListener('click', (event) => {
  if (event.target === popupWindow) {
    document.querySelector('body').classList.remove('active')
    document.querySelector('.popup-window__wrapper-content').style.transform = 'translateY(200%)';
    setTimeout(closePopup, 500);
  }
});



//Заглушаем стрелки навигации
const hiddenArrowSlider = () => {
  if (sliderDiv[1].classList.contains('swiper-slide-active')) {
    arrowSlider[0].classList.add('swiper-button-disabled');
  } else {
    document.querySelector('.swiper-button-prev').classList.remove('swiper-button-disabled');
  }
};
hiddenArrowSlider();



//Поделиться в соцю сетях
const shareButton = document.querySelectorAll('.footer__wrapper__social a');

shareButton.forEach(el => {
  el.addEventListener('click', () => {
    const shareUrl = window.location.href;
    switch (el.id) {
      case 'vk':
        window.open(`https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'odnoklassniki':
        window.open(`https://connect.ok.ru/offer?url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
    }
  });
})