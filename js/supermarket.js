// $(function(){
  // override underscores default template integration
  // with handlebars
  _.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
  };

  // Item constructor
  function Item($element){
    this.name = $element.children(".item-name").text().trim();
    this.price = parseFloat( $element.attr("data-price"), 10);
  };

  Item.prototype.toElement = (function(){
    // USE UNDERSCORES TEMPLATE FUNCTION
    const templateScope = {variable:"data"};
    const listTemplate = _.template( $("#cartItem").html(), templateScope);

    return (function(quantity,index){
      /*
       * USE TEMPLATE AND PLUG IN DATA
       * RETURN A ELEMENT STRING
      */
      return listTemplate({
        quantity: quantity,
        index: index,
        name: this.name,
        price: this.price
      });
    });
  }());

  // Main Cart
  function Cart(){
    this.shoppingList = [];
    this.tracker = {};
    this.total = 0;
  }

  Cart.prototype.updateDisplay = function() {
    // assign <this> keyword to a variable
    // in order to be used in inner function
    // if this step is skipped <this> keyword will change
    // when executing map function
    const me = this;
    // for now loop threw whole array
    var elementList = me.shoppingList.map(function(item){
      let {quantity, index} = me.tracker[item.name];
      return item.toElement(quantity,index);
    });

    env.shoppingCart.html(elementList);

    env.checkOutButton.removeAttr("disabled");

    return me;
  };

  Cart.prototype.addToCart = function( item ){

    if(this.tracker.hasOwnProperty(item.name) ){
      /*
       * if item is in shopping cart already
       * add to quantity and dont add same item again
      */
      this.tracker[ item.name ].quantity++
    } else {

      // (length of array) minus (1)
      //  to get index of item
      var index = (this.shoppingList.push( item )) - 1;

      // add item to tracker to eliminate
      // looping through shopping list every time
      this.tracker[ item.name ] = {
        index: index,
        quantity: 1
      };
    }

    return this.updateDisplay();

  };

  Cart.prototype.changeQuantity = function(name, quantity){
    this.tracker[name].quantity = quantity
  }

  Cart.prototype.removeItem = function(name){
    debugger;
    let index = this.tracker[name].index;

    // take out item from shopping list
    var deletedItem = this.shoppingList.splice(index,1);

    // delete tracker information
    delete this.tracker[ name ];

    this.updateDisplay();
  };

  Cart.prototype.finalize = function() {
    return this.shoppingList.reduce(function(acc,value){
      return acc + value.price;
    },0)
  };

  const env = {
    salesTax: false,
    content: $("#content"),
    shoppingCart: $("#shoppingCart"),
    cart: new Cart(),
    categorySelectors: $("#categorySelectors"),
    categoryItem: $("[data-category]"),
    checkOutButton: $("#checkOut")
  };


  /*
   * EVENT LISTENERS
  */

  env.content.on("click",".item-button",function(event){
    // WHEN ADD TO CART BUTTON IS PRESSED
    var content = $(this).parent('.content-item');

    var contentItem = new Item(content);

    env.cart.addToCart(contentItem);
  });



  env.shoppingCart.on("click",function(event){
    let target = event.target;
    let $target = $(target);

    // if no items are in shopping cart
    // or if the li was clicked and not its children
    // then break out of the function
    if(!env.cart.shoppingList || $target.is('li') ){ return; }

    // get the parent of this shopping cart list item
    let $parent = $target.parents('li');

    let itemName = $parent.attr("data-name");

    switch(target.nodeName){
      case 'INPUT':
        let NewQuantity = parseInt($target.val());

        (NewQuantity <= 0) ? env.cart.removeItem(itemName) : env.cart.changeQuantity( itemName, NewQuantity );
        break;
      case 'I':
        env.cart.removeItem(itemName);
        break;
      default:
        return;
    }

  });


  env.categorySelectors.on("click",function(event){

    let $target = $(event.target);

    // BREAK OUT OF THE FUNCTION IF THE TARGET ISNT AN A-TAG
    if( !$target.is("a") ){ return; }

    let categoryName = $target.text();
    let items = env.categoryItem;

    items.hide();

    if(categoryName !== "all"){
      items = items.filter("[data-category='" + categoryName + "']");
    }

    items.show();


    if(env.content.is(":hidden")){
      env.content.show();
      env.shoppingCart.hide();

    }


  });

  env.checkOutButton.on("click",function(event){
    let $this = $(this);
    if( $this.is(":disabled") ){ return; }

    env.shoppingCart.show();
    env.content.hide();

  });

// }); // end to jQuery ready shortcut function
