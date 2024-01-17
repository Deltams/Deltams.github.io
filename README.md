# Margin-trading

Margin Trading - это продукт, в котором пользователю (трейдеру), предоставляется заемный капитал для покупки активов (например, WETH).

### Целевая аудитория
1. Trader: торгует используя заемный капитал. Покупает токены дешево, продает дорого (спекулянт).
2. Liquidity Provider: предоставляет заемный капитал для трейдеров. За предоставление капитала взимает с трейдеров (процентную ставку). Рассматриваем это как “банковский вклад”.

### Ключевая ценность продукта
* Снижение требований по капиталу: трейдеры могут совершать торговые операции в 10x превышающих от их собственных средств, без предоставления каких-либо данных о себе (e-mail, номер телефона, ФИО и т. д.).
* Инвесторы зарабатывают предсказуемую доходность **без рисков*** к своему капиталу *(**безопастность обеспечивается правилами смарт-контракта**).

### Пример
Главная задача продукта, дать возможность торговать трейдеру на заемный капитал, и одновременно с этим обеспечить безопастность капитала Liquidity Provider’a.

Для трейдера в этом типе продукта есть два исхода: 
1. 🤑 Заработал деньги: возвращает заемный капитал, получает обратно свой залог + заработанную прибыль.
2. 😖 Потерял деньги: возвращает заемный капитал, получает остаток своего капитала, либо не получает ничего, т.к потерял все на трейдинге.
(Алиса далее играет роль трейдера)

#### Алиса заработала деньги
1. Алиса создает маржинальный аккаунт (Trader account) и делает депозит размером в $100.
2. Платформа предоставляет займ в x10 раз от внесенной суммы (100 * 10 = 1,000).
3. Теперь Алиса может купить ERC20 токен используя $1,000 (заемный капитал, который выдан по ставке 2%).
4. Алиса использовала $1,000 заёмного капитала и купила 1 WETH (цена на момент покупки 1 WETH = $1,000).
5. Спустя несколько дней, Алиса проверяет свой счет и видит, что WETH стоит $1,200 (на 20% выше, чем первоначальная цена покупки).
6. Алиса продает 1 WETH стоимостью $1,200 и теперь имеет на своем аккаунте $1,300 (долг составляет $1,000 + $20 (проценты) = $1020).
7. Алиса возвращает $1,020 долга и выводит $280 ($100 - начальный капитал Алисы, который был залогом, и еще $180 - это прибыль от проданного WETH).
В этом варианте, Алиса заработала +$180 при изначально вложенных $100 и Liquidity Provider остался при своем капитале +$20.

#### Алиса понесла убытки
1. Алиса создает маржинальный аккаунт (Trader account) и делает депозит размером в $100.
2. Платформа предоставляет займ в x10 раз от внесенной суммы (100 * 10 = 1,000).
3. Теперь Алиса может купить ERC20 токен используя $1,000 (заемный капитал).
4. Спустя несколько дней WETH падает в цене и теперь стоит $910 (на 9% ниже, чем первоначальная цена покупки).
5. Стоимость аккаунта Алисы составляет $1,010 ($910 — стоимость купленного ранее WETH, и $100 это изначальный капитал Алисы).
6. Для защиты капитала Liquidity Provider’a система принудительно закрывает позиции трейдера и возвращает в систему $1,010 ($1,000 — размер долга, $10 — штраф за ликвидацию).
В этом варианте, Алиса потеряла $100 (-100% капитала), и Liquidity Provider остался при своем капитале +$10.

## Развертывание и подключение контрактов в тестовой сети HardHat
(на компьютере, где разворачивается проект, по умолчанию уже установлен [Node.js](https://nodejs.org/en) и [MetaMask](https://metamask.io/) созданный от ключевых слов: 1. test, 2. test, 3. test, 4. test, 5. test, 6. test, 7. test, 8. test, 9. test, 10. test, 11. test, 12. junk)
1. Скопируйте себе проект на компьютер в папку.
2. Запустите консоль в папке, где находится проект.
3. В командной строке введите ```npm i ```. (Скачиваются дополнительные пакеты, процесс может занять некоторое время)
4. Чтоб убедиться, что все хорошо установилось введите в консоль ```npx hardhat compile```.
5. Введите в консоль команду ```npx hardhat node```. (Данная команда локально развернет тестовую сеть. **Внимание** При каждом новом запуске ```npx hardhat node``` необходимо чистить данные активности от MetaMask. (Настройки -> Дополнительно -> Очистить данные вкладки активности))
6. Откройте новый терминал (консоль) и введите следующую команду ```npx hardhat run --network localhost scripts/deploy.js```. (Данная команда произведет загрузку контрактов в нужном порядке и устанавливает необходимые зависимости между контрактами в тестовой сети)
7. Откройте MetaMask и зайдите в Настройки -> Сети -> Добавить сеть -> Добавить сеть вручную.
8. Имя сети введите удобное для Вас, например *My local host*, URL RPC можно найти в консоли, где была прописана команда ```npx hardhat node``` или ввести значение по умолчанию *http://127.0.0.1:8545/* или *http://localhost:8545*, ID блокчейна указываем *1337* (данный id можно найти в файле **hardhat.config.js**), Cимвол валюты *ETH*.
9. Переключаемся на тестовую сеть *My local host*.
10. Для взаимодействия frontend'а с контрактами использовался провайдер MetaMask.
    
Более подробную информацию можно найти по следующим ссылкам:
[Run a development network](https://docs.metamask.io/wallet/how-to/get-started-building/run-devnet/)
[Reference HardHat](https://hardhat.org/hardhat-network/docs/reference)

## Контракты, параметры и функций

Ознакомиться с моделью взаимодействия контрактов можно через [Графический сервис](https://www.drawio.com/) загрузив файл **MarginTradingDiagram.drawio**.

### LiquidityPool

контракт для сбора ликвидности, привлечения вкладчиков и получения процента от вложенных USDC

#### Глобальные переменные

```IERC20 public USDC;```

интерфейс для взаимодействия с ERC20 токенами, в данном случае с USDC

```uint256 public balanceX;```

всего внесенных денег от инвесторов, расчет идет в USDC

```uint256 public balanceY;```

всего выпущенных виртуальных токенов, нужно для расчета индивидуальной доли прибыли каждого инвестора

```ICentralAccount public ICA;```

интерфейс для взаимодействия с центральным аккаунтом

```using TransferHelper for IERC20;```

контракт для безопасного перевода токенов ERC20 между контрактами

```uint256 constant USDC_DECIMALS = 10 ** 6;```

константа, показывает количество знаков после запятой, нужна для расчета USDC

```uint256 constant SHARE_DECIMALS = 10 ** 18;```

константа, показывает количество знаков после запятой, нужна для расчета общей доли

```mapping(address => uint256) investorToShare;```

доля прибыли Liquidity Provider’a от всех внесенных денег

#### Функции

```constructor(address _USDC, address _CA, uint256 _amount)```

начальное создание контракта (функция, которая вызывается при deploy контракта)

*address _USDC* - адрес контракта ERC20 токена в основной/тестовой сети (в данном случае USDC)

*address _CA* - адрес контракта CentralAccount в основной/тестовой сети

*uint256 _amount* - начальный капитал для контракта Liquidity Pool (Желательно указать как 100 USDC и перевести на центральный аккаунт данную сумму)

```function transferToLP(uint256 _amount) external```

переводит денеги в Liquidity pool (все деньги хранятся на Central account)

*uint256 _amount* - количество денег для перевода (указывать в виде USDC)

```function accrueProfit(uint256 _amount) external```

начисляет полученную прибыть инвесторам (вкладчикам)

*uint256 _amount* - полученная прибыль (подавать в виде USDC)

```function accrueLoss(uint256 _amount) external```

начисляет полученный убыток инвесторам (вкладчикам)

*uint256 _amount* - полученный убыток (подавать в виде USDC)

```function transfer(address _from, address _to, uint256 _amount) internal```

переводит USDC от владельца к определенному адресу (получателю)

*address _from* - адрес владельца USDC

*address _to* - адрес получателя USDC

*uint256 _amount* - количество передаваемых USDC

```function safeTransferFrom(address _token, address _from, address _to, uint256 _amount) internal```

безопасный перевод ERC20 токенов от владельца к получателю

*address _token* - адрес отправляемого токенов ERC20 (в нашем случае USDC)

*address _from* - адрес владельца токенов ERC20 (в нашем случае USDC)

*address _to* - адрес получателя токенов ERC20 (в нашем случае USDC)

*uint256 _amount* - количество передаваемых токенов ERC20 (в нашем случае USDC)

```function withdraw(uint256 _amount) external```

выводит USDC из пула ликвидности на адрес отправителя транзакции

*uint256 _amount* - количество выводимых USDC из пула ликвидности

```function getUserBalance() public view returns (uint256)```

показывает текущий баланс поставщика ликвидности (вкладчика)

### CentralAccount

контракт, которые хранит все USDC и WETH от Трейдеров и Вкладчиков. Дает разрешение трейдерам для кредитования и торговли заемными средствами

#### Глобальные переменные

```address SC;```

адрес контракта SwapContract в основной/тестовой сети

```IERC20 public USDC;```

интерфейс для взаимодействия с ERC20 токенами, в данном случае с USDC

```IERC20 public WETH;```

интерфейс для взаимодействия с ERC20 токенами, в данном случае с WETH

```ILiquidityPool public ILP;```

интерфейс для взаимодействия с контрактом LiquidityPool

```ITraderAccount public ITRA;```

интерфейс для взаимодействия с контрактом TraderAccount

```uint256 public countUSDCOwner;```

USDC владельца контракта, которые были получены с процента прибыли от торговли Трейдеров

```uint256 public countUSDCTraders;```

USDC трейдеров, которые сейчас участвуют в активной торговле

```using TransferHelper for IERC20;```

контракт для безопасного перевода токенов ERC20 между контрактами

```uint16 public ownerProfit = 1000;```

указание процента комиссии, которую получает владелец контракта от полученной прибыли

```uint16 constant COEF_OWNER_PROFIT = 10000;```

константа для перевода ownerProfit в проценты (ownerProfit / COEF_OWNER_PROFIT = процент прибыли владельца контракта)

#### Функции

```constructor(address _USDC, address _WETH) Ownable(msg.sender)```

начальное создание контракта (функция, которая вызывается при deploy контракта)

*address _USDC* - адрес контракта ERC20 токена в основной/тестовой сети (в данном случае USDC)

*address _WETH* - адрес контракта ERC20 токена в основной/тестовой сети (в данном случае WETH)

*Ownable(msg.sender)* - указывает на владельца контракта (автоматически при deploy)

```function setLP(address _LP) external onlyOwner()```

изменяет ссылку для взаимодействия с контрактом LiquidityPool

*address _LP* - адрес на контракт LiquidityPool в основной/тестовой сети

```function setTRA(address _TRA) external onlyOwner()```

изменяет ссылку для взаимодействия с контрактом TraderAccount

*address _TRA* - адрес на контракт TraderAccount в основной/тестовой сети

```function setSC(address _SC) external onlyOwner()```

изменяет ссылку для взаимодействия с контрактом SwapContract

*address _SC* - адрес на контракт SwapContract в основной/тестовой сети

```function setOwnerProfit(uint16 _ownerProfit) external onlyOwner()```

изменяет процент взимаемый с полученной прибыли от торговли Трейдерами

*uint16 _ownerProfit* - удерживаемый процент, который будет получать владелец контракта от прибыли (**указывать не больше COEF_OWNER_PROFIT **)

```function approve(address _token, address _account, uint256 _amount) external```

дает разрешение определенному адресу право на перевод определенного токена ERC20 (Доступно только для LiquidityPool, SwapContract и TraderAccount) 

*address _token* - адрес отправляемого токенов ERC20 (в нашем случае USDC или WETH)

*address _account* - адрес кому доверяется перевод токенов ERC20 (в нашем случае USDC или WETH)

*uint256 _amount* - количество передаваемых токенов ERC20 (в нашем случае USDC или WETH)

```function newProfit(uint256 _amount) internal```

начисляет полученную прибыть инвесторам (вкладчикам) и владельцу контракта, передает вызов в LiquidityPool 

*uint256 _amount* - полученная прибыль (подавать в виде USDC)

```function newLoss(uint256 _amount) internal```

начисляет полученный убыток инвесторам (вкладчикам), передает вызов в LiquidityPool

*uint256 _amount* - полученный убыток (подавать в виде USDC)

```function getTraderDebt(uint256 _amount) external onlyTRA()```

резервирует USDC для торговли Трейдером 

*uint256 _amount* - количество USDC, которое необходимо зарезервировать для торговли Трейдера

```function getCountUSDCTraders() external view returns (uint256)```

возвращает количество USDC, которым сейчас торгуют Трейдеры (подразумевается вызов из внешних контрактов в нашем случае LiquidityPool)

```function returnTraderDebt(uint256 _amount, uint256 _profitOrLoss, bool _PORL) external onlyTRA()```

обрабатывает возвращение долга от трейдера в зависимости от прибыли/убытка торговли 

*uint256 _amount* - возвращаемая сумма долга Трейдера в USDC

*uint256 _profitOrLoss* - число показывающее прибыль/убыток от торговли Трейдера (подавать в виде USDC)

*bool _PORL* - показатель прибыли - true или убытка - false

```function availableUSDC() public view returns(uint256 answer)```

показывает число доступных USDC для выдачи в кредит Трейдерам (результат возвращается в виде значения USDC)

```function withdraw(uint256 _amount) external onlyOwner()```

позволяет создателю контракта снимать полученную прибыль от сделок Трейдеров

*uint256 _amount* - количество USDC, которое необходимо вывести с контракта владельцу

```modifier onlyTRA()```

модификатор, который проверяет возможность вызова функция только для контракта TraderAccount

### RiskManager

контракт, который контролирует выполнение условий Трейдерами и при нарушении ликвидирует позицию

#### Глобальные переменные

```address[] traders;```

массив всех Трейдеров, у которых сейчас есть не закрытый кредит

```mapping(address => uint256) mapping_traders;```

словарь хранит индекс на массив Трейдеров по их адресу 

```ITraderAccount public ITRA;```

интерфейс для взаимодействия с контрактом TraderAccount

```uint16 public HF_ELIMINATE = 10540;```

число, при котором будет вызвана функция ликвидации аккаунта Трейдера

#### Функции

```constructor(address _TRA) Ownable(msg.sender)```

начальное создание контракта (функция, которая вызывается при deploy контракта)

*address _TRA* - адрес на контракт TraderAccount в основной/тестовой сети

*Ownable(msg.sender)* - указывает на владельца контракта (автоматически при deploy)

```function addTrader(address _trader) external onlyTRA()```

добавляет Трейдера на отслеживание и проверки его на ликвидацию

*address _trader* - адрес на кошелек трейдера в TraderAccount

```function getCountTraders() external view returns (uint256)```

возвращает количество трейдеров, у которых сейчас имеется кредит

```function checkTraders(uint256 _begin, uint256 _end) external view returns (uint256[] memory answer)```

возвращает массив из диапазона со значением HF для указанных Трейдеров

*uint256 _begin* - начальное число, от которого будут перебираться Трейдеры (начинает с 0)

*uint256 _end* - конечное число, до которого будут перебираться Трейдеры (не включительно)

```function checkTradersDay(uint256 _begin, uint256 _end) external view returns (uint256[] memory answer)```

возвращает массив из диапазона со значением прошедших дней после кредитования для указанных Трейдеров

*uint256 _begin* - начальное число, от которого будут перебираться Трейдеры (начинает с 0)

*uint256 _end* - конечное число, до которого будут перебираться Трейдеры (не включительно)

```function eliminate(uint256 _traderId) external returns (uint8)```

ликвидирует конкретного Трейдера по его индексу в массиве, передает вызов ликвидации в TraderAccount 

*uint256 _traderId* - индекс в массиве Трейдеров с кредитами

```function deleteTrader(address _trader) external onlyTRA()```

удаляет из массива Трейдера с кредитом 

*address _trader* - адрес кошелька Трейдера из TraderAccount

```function setHFEliminate(uint16 _new_HF_ELIMINATE) external onlyOwner```

изменение минимального значения, при котором происходит ликвидация позиций Трейдера 

*uint16 _new_HF_ELIMINATE* - процент, который считается по следующей формуле: Текущая стоимость аккаунта в USDC / сумма выданная в кредит USDC (учитывается до 4 знаков после запятой)

```modifier onlyTRA()```

модификатор, который указывает возможность вызова функций только для контракта TraderAccount

### SwapContract

контракт, который позволяет Трейдерам взаимодействовать с Uniswap и обменивать WETH на USDC и USDC на WETH

#### Глобальные переменные

```using TransferHelper for IERC20;```

контракт для безопасного перевода токенов ERC20 между контрактами

```IQuoter public constant quoter = IQuoter(0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6);```

```ISwapRouter public constant router = ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);```

```ICentralAccount public ICA;```

интерфейс для взаимодействия с контрактом CentralAcount

```address public TRA;```

адрес на контракт TraderAccount в основной/тестовой сети

```address public USDC;```

адрес на контракт токенов USDC в основной/тестовой сети

```address public WETH;```

адрес на контракт токенов WETH в основной/тестовой сети

```UniswapV2Router02 public constant router02 = UniswapV2Router02(payable(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D));```

#### Функции

```constructor(address _CA, address _TRA, address _USDC, address _WETH) Ownable(msg.sender)```

начальное создание контракта (функция, которая вызывается при deploy контракта)

*address _CA* - адрес контракта CentralAccount в основной/тестовой сети

*address _TRA* - адрес контракта TraderAccount в основной/тестовой сети

*address _USDC* - адрес контракта ERC20 токена в основной/тестовой сети (в данном случае USDC)

*address _WETH* - адрес контракта ERC20 токена в основной/тестовой сети (в данном случае WETH)

*Ownable(msg.sender)* - указывает на владельца контракта (автоматически при deploy)

```function quoteWETHToUSDC(uint256 _amountIn) external view returns(uint256)```

получение текущего курса пары WETH/USDC на Uniswap для определенного количества токенов

*uint256 _amountIn* - количество токенов WETH

```function swapWETHToUSDC(uint256 _amountIn, uint256 _amountOutMinimum) external returns(uint256 amountOut)```

перевод WETH/USDC через Uniswap для определенного количества токенов

*uint256 _amountIn* - количество токенов WETH

*uint256 _amountOutMinimum* - минимальное ожидаемое количество токенов USDC после обмена

```function swapUSDCToWETH(uint256 _amountIn, uint256 _amountOutMinimum) external returns(uint256 amountOut)```

перевод USDC/WETH через Uniswap для определенного количества токенов

*uint256 _amountIn* - количество токенов USDC

*uint256 _amountOutMinimum* - минимальное ожидаемое количество токенов WETH после обмена

### TraderAccount

контракт, который предоставляет возможность Трейдерам получить заемные средства и торговать ими на Uniswap

#### Глобальные переменные

```mapping(address => uint256) traderToUSDC;```

словарь, который хранит адрес кошелька Трейдера и количество USDC доступное у него

```mapping(address => uint256) traderToWEther;```

словарь, который хранит адрес кошелька Трейдера и количество WETH доступное у него

```mapping(address => uint256) traderToDebt;```

словарь, который хранит адрес кошелька Трейдера и количество USDC взятые в кредит

```mapping(address => uint256) traderToTime;```

словарь, который хранит адрес кошелька Трейдера и день взятия USDC в кредит

```IRiskManager public IRM;```

интерфейс для взаимодействия с контрактом RiskManager

```ISwapContract public ISC;```

интерфейс для взаимодействия с контрактом SwapContract

```ICentralAccount public ICA;```

интерфейс для взаимодействия с контрактом CentralAcount

```IERC20 public USDC;```

интерфейс для взаимодействия с ERC20 токенами, в данном случае с USDC

```IERC20 public WETH;```

интерфейс для взаимодействия с ERC20 токенами, в данном случае с WETH

```uint16 public debtInterest = 200;```

процент, который будет удержан с суммы кредита Трейдера 

```uint16 constant HF_DECIMALS = 10 ** 4;```

константа, которая указывает количество знаков после запятой для расчета значения HF

```uint16 constant COEF_DEBT_INTEREST = 10000;```

константа для расчета процента удержания с кредита Трейдера

```uint8 constant COEF_DEBT = 10;```

константа, которая показывает максимальный коэффициент одобряемого плеча 

#### Функции

```constructor(address _USDC, address _WETH, address _CA) Ownable(msg.sender)```

начальное создание контракта (функция, которая вызывается при deploy контракта)

*address _USDC* - адрес контракта ERC20 токена в основной/тестовой сети (в данном случае USDC)

*address _WETH* - адрес контракта ERC20 токена в основной/тестовой сети (в данном случае WETH)

*address _CA* - адрес контракта CentralAccount в основной/тестовой сети

*Ownable(msg.sender)* - указывает на владельца контракта (автоматически при deploy)

```function setRiskManager(address _RM) external onlyOwner()```

изменяет ссылку для взаимодействия с контрактом RiskManager

*address _RM* - адрес на новый контракт RiskManager в основной/тестовой сети

```function setSwapContract(address _SC) external onlyOwner()```

изменяет ссылку для взаимодействия с контрактом SwapContract

*address _SC* - адрес на новый контракт SwapContract в основной/тестовой сети

```function setDebtInterest(uint16 _newDebtInterest) external onlyOwner()```

изменят процент, под который выдаются кредиты Трейдерам

*uint16 _newDebtInterest* - новая процентная ставка (не должна превышать значение COEF_DEBT_INTEREST)

```function transferToTraderUSDC(uint256 _amount) external```

внесение Трейдером залога, перед вызовом данной функции необходимо дать разрешение контракту TraderAccount на перевод USDC

*uint256 _amount* - количество USDC передаваемое Трейдером в виде залога

```function transferDebtFromCA(uint256 _amount) external```

получение кредита Трейдером от поставщиков ликвидности (вкладчиков)

*uint256 _amount* - количество USDC, которое Трейдер хочет получить в кредит

```function transferDebtToCA() external```

возвращает весь долга от Трейдера с процентами

```function transfer(address _from, address _to, uint256 _amount) internal```

переводит USDC от владельца к определенному адресу (получателю)

*address _from* - адрес владельца USDC

*address _to* - адрес получателя USDC

*uint256 _amount* - количество передаваемых USDC

```function safeTransferFrom(address _token, address _from, address _to, uint256 _amount) internal```

безопасный перевод ERC20 токенов от владельца к получателю

*address _token* - адрес отправляемого токенов ERC20 (в нашем случае USDC)

*address _from* - адрес владельца токенов ERC20 (в нашем случае USDC)

*address _to* - адрес получателя токенов ERC20 (в нашем случае USDC)

*uint256 _amount* - количество передаваемых токенов ERC20 (в нашем случае USDC)

```function withdrawUSDC(uint256 _amount) external```

выводит USDC с аккаунта Трейдера на адрес отправителя транзакции

*uint256 _amount* - количество выводимых USDC

```function getUserBalanceUSDC() public view returns (uint256)```

возвращает текущий баланс USDC Трейдера

```function getUserBalanceUSDCWithoutDebt() public view returns (uint256)```

возвращает баланс пользователя в USDC после погашения долга (без процентов)

```function getUserDebt() public view returns (uint256)```

возвращает текущий долг Трейдера в USDC

```function getUserBalanceWEther() public view returns (uint256)```

возвращает текущий баланс Трейдера в WETH

```function getAccountValueInUSDC(address _trader) public view returns (uint256)```

возвращает текущую полную стоимость аккаунта в USDC

*address _trader* - адрес кошелька Трейдера в контракте TraderAccount

```function eliminate(address _traderKill) external onlyRM()```

ликвидирует все позиции трейдера по приказу контракта RiskManager и возвращает USDC в пул ликвидности

*address _traderKill* - адрес кошелька Трейдера в контракте TraderAccount

```function getHF(address _trader) external view returns (uint256 _HF)```

возвращает текущую оценку риска ликвидации аккаунта Трейдера

*address _trader* - адрес кошелька Трейдера в контракте TraderAccount

```function getDayDebt(address _trader) external view returns (uint256 _days)```

возвращает количество дней прошедших с взятия кредита Трейдером

*address _trader* - адрес кошелька Трейдера в контракте TraderAccount

```function swapUSDCToWETH(uint256 _amount, uint256 _amountOutMinimum) public```

производит обмен токенов USDC на токены WETH

*uint256 _amount* - количество токенов USDC

*uint256 _amountOutMinimum* - текущий курс обмена USDC на WETH

```function swapWETHToUSDC(uint256 _amount, uint256 _amountOutMinimum) public```

производит обмен токенов WETH на токены USDC

*uint256 _amount* - количество токенов WETH

*uint256 _amountOutMinimum* - текущий курс обмена WETH на USDC

```modifier onlyRM()```

модификатор, который указывает возможность вызова функций только для контракта RiskManager

**ОЧЕНЬ ВАЖНО: Все созданное в проекте и описанное выше - не является индивидуальной инвестиционной рекомендацией**
