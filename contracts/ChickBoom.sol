pragma solidity ^0.5.11;


contract ChickBoom {

    uint8 private STATE_STOPPED = 0;
    uint8 private STATE_TICKET_SELLING = 1;

    address payable private owner;
    uint256 private ticket_price;
    uint32 private tickets_count;
    uint32 private sold_tickets = 0;
    uint8 private lottery_state = STATE_STOPPED;

    address[] private players;

    modifier only_owner() {
        require(msg.sender == owner, "Need owner permission");
        _;
    }

    constructor(uint32 new_tickets_count, uint256 new_ticket_price) public {
        owner = msg.sender;
        tickets_count = new_tickets_count;
        ticket_price = new_ticket_price;
        players = new address[](new_tickets_count);
    }

    function buy_ticket() public payable {
        require(lottery_state == STATE_TICKET_SELLING, "Tickets not selling now");
        require(sold_tickets < tickets_count, "All tickets sell");
        require(msg.value >= ticket_price, "Not enought amount");
        sold_tickets = sold_tickets+1;
        players[sold_tickets] = msg.sender;
        if (sold_tickets == tickets_count) {
          start_lottery();
        }
    }

    function reward() public only_owner {
        require(lottery_state == STATE_TICKET_SELLING, "Lottery not started");
        for (uint32 i=0; i<players.length; i++) {
            address payable participant_addres = address(uint160(players[i]));
            participant_addres.transfer(ticket_price);
        }
        lottery_state = STATE_STOPPED;
        sold_tickets = 0;
    }

    function start_selling() public only_owner {
        require(lottery_state == STATE_STOPPED, "Lottery already started");
        lottery_state = STATE_TICKET_SELLING;
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

    function start_lottery() private payable {
        require(lottery_state == STATE_TICKET_SELLING, "Lottery not started");
        require(sold_tickets > 0, "Not sold tickets");
        uint cush = ticket_price * sold_tickets;
        uint winner_id = (block.timestamp-1)%(sold_tickets);
        address payable winner_addres = address(uint160(players[winner_id]));
        winner_addres.transfer(cush);
        lottery_state = STATE_STOPPED;
        sold_tickets = 0;
        players = new address[](tickets_count);
    }
}
