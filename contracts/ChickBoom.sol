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

  modifier is_lottery_started() {
    require(lottery_state == State.Started, "Lottery not started now");
    _;
  }

  enum State { Stopped, Started }

  address payable private owner;
  uint256 private ticket_price;
  uint32 private tickets_count;
  uint32 private sold_tickets = 0;
  uint private round = 0;
  State private lottery_state = State.Stopped;

  address[] private players_addresses;
  bool[] private players_states;
  mapping (uint => Win) private winners;


  constructor(uint32 new_tickets_count, uint256 new_ticket_price) public {
    owner = msg.sender;
    tickets_count = new_tickets_count;
    ticket_price = new_ticket_price;
  }

  function start_selling() external only_owner {
    require(lottery_state == State.Stopped, "Lottery already started");
    lottery_state = State.Started;
    sold_tickets = 0;
    round = round+1;
    players_addresses = new address[](tickets_count);
    players_states = new bool[](tickets_count);
  }

  function buy_ticket() external is_lottery_started payable {
    require(msg.value >= ticket_price, "Not enought amount");
    players_addresses[sold_tickets] = msg.sender;
    players_states[sold_tickets] = true;
    sold_tickets = sold_tickets+1;
  }

  function reward() external is_lottery_started payable {
    for (uint32 i=0; i<sold_tickets; i++) {
      address reward_addr = players_addresses[i];
      if (reward_addr == msg.sender) {
        address payable player_addres = address(uint160(reward_addr));
        player_addres.transfer(ticket_price);
        players_states[i] = false;
        return;
      }
    }
    revert("You have not ticket");
  }

  function lets_win() external is_lottery_started only_owner {
    require(sold_tickets == tickets_count, "Tickets not solded");
    uint cush = ticket_price * sold_tickets;
    uint winner_id = (block.timestamp-1)%(sold_tickets);
    while (!players_states[winner_id]) {
      winner_id = (block.timestamp-1)%(sold_tickets);
    }
    address winner_address = players_addresses[winner_id];
    winners[round] = Win({addr: winner_address, cush: cush});
    lottery_state = State.Stopped;
    emit WinEvent(winner_address, round, cush);
  }

  function get_cush(uint _round) external payable {
    Win memory winner = winners[_round];
    require(winner.addr == msg.sender, "You have not cush");
    address payable winner_address = address(uint160(msg.sender));
    winner_address.transfer(winner.cush);
    delete winners[_round];
  }

  function get_lottery_state() public view returns (State) {
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

  function get_round() public view returns (uint) {
    return round;
  }

  fallback() external payable {}
}
