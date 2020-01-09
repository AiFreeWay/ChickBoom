pragma solidity ^0.6.0;


contract ChickBoom {

  struct Win {
    address addr;
    uint cush;
  }

  event WinEvent(
    address indexed winner,
    uint round,
    uint cush
  );

  modifier only_owner() {
    require(msg.sender == owner, "Need owner permission");
    _;
  }

  uint8 private STATE_STOPPED = 0;
  uint8 private STATE_TICKET_SELLING = 1;

  address payable private owner;
  uint256 private ticket_price;
  uint32 private tickets_count;
  uint32 private sold_tickets = 0;
  uint private round = 0;
  uint8 private lottery_state = STATE_STOPPED;

  address[] private players_addresses;
  bool[] private players_states;
  mapping (uint => Win) private winners;


  constructor(uint32 new_tickets_count, uint256 new_ticket_price) public {
    owner = msg.sender;
    tickets_count = new_tickets_count;
    ticket_price = new_ticket_price;
  }

  function start_selling() public only_owner {
    require(lottery_state == STATE_STOPPED, "Lottery already started");
    lottery_state = STATE_TICKET_SELLING;
    sold_tickets = 0;
    round = round+1;
    players_addresses = new address[](tickets_count);
    players_states = new bool[](tickets_count);
  }

  function buy_ticket() public payable {
    require(lottery_state == STATE_TICKET_SELLING, "Tickets not selling now");
    require(msg.value >= ticket_price, "Not enought amount");
    players_addresses[sold_tickets] = msg.sender;
    players_states[sold_tickets] = true;
    sold_tickets = sold_tickets+1;
    if (sold_tickets == tickets_count) {
      start_lottery();
    }
  }

  function reward() public payable {
    require(lottery_state == STATE_TICKET_SELLING, "Lottery not started");
    for (uint32 i=0; i<sold_tickets; i++) {
      address reward_addr = players_addresses[i];
      if (reward_addr == msg.sender) {
        address payable player_addres = address(uint160(reward_addr));
        player_addres.transfer(ticket_price);
        players_states[i] = false;
        return;
      }
    }
  }

  function get_cush(uint round) public payable {
    Win memory winner = winners[round];
    require(winner.addr == msg.sender, "You have not cush");
    msg.sender.transfer(winner.cush);
    delete winners[round];
  }

  function get_lottery_state() public view returns (uint8) {
    return lottery_state;
  }

  function get_ticket_price() public view returns (uint256) {
    return ticket_price;
  }

  function get_sold_tickets() public view returns (uint32) {
    return sold_tickets;
  }

  function get_tickets_count() public view returns (uint32) {
    return tickets_count;
  }

  function get_owner() public view returns (address) {
    return owner;
  }

  function start_lottery() private {
    lottery_state = STATE_STOPPED;
    uint cush = ticket_price * sold_tickets;
    uint winner_id = (block.timestamp-1)%(sold_tickets);
    while (!players_states[winner_id]) {
      winner_id = (block.timestamp-1)%(sold_tickets);
    }
    address winner_address = players_addresses[winner_id];
    winners[round] = Win({addr: winner_address, cush: cush});
    emit WinEvent(winner_address, round, cush);
  }
}
