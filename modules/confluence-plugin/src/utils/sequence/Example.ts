const Sequence = `title Order Service (Demonstration only)
// Styling participants with background colors is an experimental feature.
// This feature is available for users to test and provide feedback.
@Actor Client #FFEBE6
@Boundary OrderController #0747A6
@EC2 <<BFF>> OrderService #E3FCEF
group BusinessService {
  @Lambda PurchaseService
  @AzureFunction InvoiceService
}

@Starter(Client)
//\`POST /orders\`
OrderController.post(payload) {
  OrderService.create(payload) {
    order = new Order(payload)
    if(order != null) {
      par {
        PurchaseService.createPO(order)
        InvoiceService.createInvoice(order)      
      }      
    }
  }
}`;

const Mermaid = `sequenceDiagram
title This is an example sequence diagram
participant A
participant B
participant C
participant D
A->>B: Normal line
B-->>C: Dashed line
C->>D: Open arrow
D-->>A: Dashed open arrow`;

export default {
    Sequence,
    Mermaid
}
