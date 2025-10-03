# Cheatsheet de padrões de projeto para Java

Este guia resume padrões criacionais, estruturais e comportamentais que aparecem com frequência na disciplina. Cada item traz intenção, sinais de uso e um trecho Java para ilustrar o contrato baseado em interfaces.

## Como navegar

- **Intenção**: resposta rápida ao problema de design.
- **Quando usar**: sintomas no código ou requisitos que justificam o padrão.
- **Interfaces-chave**: abstrações que viabilizam baixo acoplamento.
- **Exemplo Java**: trecho compilável simplificado.

## Visão geral rápida

| Padrão          | Intenção                                                | Quando usar                                                                 | Interfaces-chave                                            |
| --------------- | ------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Strategy        | Trocar algoritmos em tempo de execução.                 | Regras que variam com frequência ou dependem de contexto.                   | `PricingStrategy`, `PaymentGateway`.                        |
| Template Method | Reutilizar fluxo fixo com passos customizáveis.         | Há algoritmo estável com variações mínimas.                                 | Classe abstrata com métodos `final` e `protected abstract`. |
| Observer        | Notificar múltiplos assinantes desacoplados.            | Quando um evento precisa propagar atualizações a componentes independentes. | `EventPublisher`, `EventListener`.                          |
| Decorator       | Estender comportamento dinamicamente.                   | Combinar responsabilidades sem explosão de subclasses.                      | Interface compartilhada (`Notifier`) + wrappers concretos.  |
| Factory Method  | Delegar criação de objetos a subclasses ou estratégias. | Quando construção exige lógica especializada ou depende de contexto.        | `PaymentFactory`, método `create()`.                        |
| Adapter         | Integrar API externa a contrato interno.                | Sistemas legados ou bibliotecas incompatíveis.                              | Interface alvo + adaptador que encapsula dependência.       |
| Command         | Representar ações como objetos.                         | Filas, desfazer/refazer, macros de operações.                               | `Command`, `CommandBus`.                                    |
| Singleton       | Garantir instância única com acesso global controlado.  | Recursos compartilhados e imutáveis (ex.: registradores).                   | Método `getInstance()` sincronizado.                        |

## Exemplos essenciais

### Strategy — motores de cálculo flexíveis

```java
public interface PricingStrategy {
    BigDecimal calculate(BigDecimal amount);
}

public final class WeekendPricing implements PricingStrategy {
    @Override
    public BigDecimal calculate(BigDecimal amount) {
        return amount.multiply(BigDecimal.valueOf(0.9));
    }
}

public final class CheckoutService {
    private PricingStrategy strategy;

    public CheckoutService(PricingStrategy strategy) {
        this.strategy = strategy;
    }

    public void setStrategy(PricingStrategy strategy) {
        this.strategy = strategy;
    }

    public BigDecimal total(BigDecimal amount) {
        return strategy.calculate(amount);
    }
}
```

Sinais de alerta: condicionais múltiplos para regras de cálculo ou duplicação de algoritmos semelhantes.[^gof]

### Template Method — fluxo fixo com ganchos

```java
public abstract class PaymentProcessor {
    public final Receipt process(BigDecimal amount) {
        validate(amount);
        authorize(amount);
        return settle(amount);
    }

    protected void validate(BigDecimal amount) {
        Objects.requireNonNull(amount);
        if (amount.signum() <= 0) {
            throw new IllegalArgumentException("Invalid amount");
        }
    }

    protected abstract void authorize(BigDecimal amount);

    protected abstract Receipt settle(BigDecimal amount);
}
```

Use quando deseja padronizar o fluxo e permitir que subclasses implementem somente partes variáveis.[^gof]

### Observer — notificações desacopladas

```java
public interface DomainEvent {}

public interface DomainEventListener<T extends DomainEvent> {
    void onEvent(T event);
}

public final class InMemoryEventBus {
    private final Map<Class<?>, List<DomainEventListener<?>>> listeners = new ConcurrentHashMap<>();

    public <T extends DomainEvent> void subscribe(Class<T> type, DomainEventListener<T> listener) {
        listeners.computeIfAbsent(type, ignored -> new CopyOnWriteArrayList<>()).add(listener);
    }

    public void publish(DomainEvent event) {
        listeners.getOrDefault(event.getClass(), List.of())
            .forEach(listener -> ((DomainEventListener<DomainEvent>) listener).onEvent(event));
    }
}
```

Aplicável quando múltiplos componentes reagem ao mesmo evento sem depender uns dos outros.[^headfirst]

### Decorator — comportamento em camadas

```java
public interface Notifier {
    void send(String message);
}

public class EmailNotifier implements Notifier {
    @Override
    public void send(String message) {
        System.out.println("Email: " + message);
    }
}

public abstract class NotifierDecorator implements Notifier {
    protected final Notifier delegate;

    protected NotifierDecorator(Notifier delegate) {
        this.delegate = delegate;
    }
}

public final class SmsNotifier extends NotifierDecorator {
    public SmsNotifier(Notifier delegate) {
        super(delegate);
    }

    @Override
    public void send(String message) {
        delegate.send(message);
        System.out.println("SMS: " + message);
    }
}
```

Permite combinar responsabilidades sem herança múltipla e com composição explícita.[^headfirst]

### Factory Method — construção especializada

```java
public abstract class PaymentGatewayFactory {
    public final PaymentGateway createGateway() {
        PaymentGateway gateway = instantiate();
        gateway.configure();
        return gateway;
    }

    protected abstract PaymentGateway instantiate();
}

public final class PixGatewayFactory extends PaymentGatewayFactory {
    @Override
    protected PaymentGateway instantiate() {
        return new PixGateway();
    }
}
```

Encapsula conhecimento de construção e mantém clientes dependentes apenas da abstração.[^gof]

### Adapter — integração segura

```java
public interface AccountingExporter {
    void export(Invoice invoice);
}

public final class LegacyAccountingAdapter implements AccountingExporter {
    private final LegacyAccountingClient client;

    public LegacyAccountingAdapter(LegacyAccountingClient client) {
        this.client = client;
    }

    @Override
    public void export(Invoice invoice) {
        client.send(invoice.toCsv());
    }
}
```

Permite converter contratos incompatíveis sem alterar código legado.[^cleanarch]

### Command — ações como objetos

```java
public interface Command {
    void execute();
}

public final class CloseAccount implements Command {
    private final AccountService service;
    private final UUID accountId;

    public CloseAccount(AccountService service, UUID accountId) {
        this.service = service;
        this.accountId = accountId;
    }

    @Override
    public void execute() {
        service.close(accountId);
    }
}
```

Útil para filas, auditoria e desfazer quando combinado com histórico.[^gof]

### Singleton — estado único controlado

```java
public final class ClockProvider {
    private static volatile ClockProvider instance;

    private ClockProvider() {}

    public static ClockProvider getInstance() {
        if (instance == null) {
            synchronized (ClockProvider.class) {
                if (instance == null) {
                    instance = new ClockProvider();
                }
            }
        }
        return instance;
    }

    public Instant now() {
        return Instant.now();
    }
}
```

Restrinja a uso em componentes idempotentes para evitar acoplamento excessivo.[^effective]

## Checklist de revisão

1. O padrão escolhido reduz condicionais ou duplicação?
2. Interfaces expõem apenas o que os clientes realmente precisam?
3. Há testes cobrindo a variação de comportamento?
4. Documente responsabilidades e limites dos participantes principais.

## Referências

[^gof]: GAMMA, E. et al. _Design Patterns: Elements of Reusable Object-Oriented Software_. Addison-Wesley, 1994.

[^headfirst]: FREEMAN, E.; FREEMAN, E. _Head First Design Patterns_. 3. ed. O'Reilly, 2021.

[^cleanarch]: MARTIN, R. C. _Clean Architecture_. Prentice Hall, 2017.

[^effective]: BLOCH, J. _Effective Java_. 3. ed. Addison-Wesley, 2018.
