// $(function(){
  // override underscores default template integration
  // with handlebars
  _.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
  };

  //  jquery extends

  $.fn.extend({
    toggleShortcut:function(){
      console.log(this);
      this.toggle();
      this.next().toggle();
    }
  })

  // Item constructor
  function Item($element,$shortcut){
    this.name = $element.children(".item-name").text().trim();
    this.price = parseFloat( $element.attr("data-price"), 10);
    this.$node = $element
    this.$shortcut = $element.find(".shortcut-cart");
  };

  Item.prototype.toElement = (function(){
    // USE UNDERSCORES TEMPLATE FUNCTION
    const templateScope = {variable:"data"};
    const listTemplate = _.template( $("#cartItemTemplate").text(), templateScope);
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

  Cart.prototype.addToCart = function( item ){
    let me = this
    if(me.tracker.hasOwnProperty(item.name) ){
      /*
       * if item is in shopping cart already
       * add to quantity and dont add same item again
      */
      me.tracker[ item.name ].quantity++
    } else {

      // (length of array) minus (1)
      //  to get index of item
      var index = (me.shoppingList.push( item )) - 1;

      // add item to tracker to eliminate
      // looping through shopping list every time
      me.tracker[ item.name ] = {
        index: index,
        quantity: 1
      };
    }

    // add to the total
    me.total += item.price

    let cartItem =  item.toElement(1,index);

    item.$shortcut.append(cartItem);

    env.shoppingCart.append( cartItem );

  };

  Cart.prototype.getItem = function(itemName){
    let itemIndex = this.tracker[itemName].index;

    return this.shoppingList[itemIndex];
  }

  Cart.prototype.updateQuantity = function(name, quantity){
    let itemInfo = this.tracker[name];
    let itemPrice = this.getItem(name).price;
    let newQuantity =  quantity < itemInfo.quantity ? -itemPrice : itemPrice;

    this.total += newQuantity
    itemInfo.quantity = quantity;
  }

  Cart.prototype.removeItem = function(name){
    // debugger;
    let itemTracker = this.tracker[name]

    let index = itemTracker.index;

    // take out item from shopping list
    var deletedItem = this.shoppingList.splice(index,1)[0];

    // take out shortcut
    deletedItem.$shortcut.prev().toggleShortcut();

    // minus from total
    this.total -= deletedItem.price * itemTracker.quantity;

    $("[data-name='" + deletedItem.name + "']").remove();

    deletedItem.$shortcut.html("");

    // delete tracker information
    delete this.tracker[ name ];
  };

  // Cart.prototype. = function() {
    // return
  // };

  const env = {
    salesTax: false,
    content: $("#content"),
    shoppingCart: $("#shoppingCart"),
    cart: new Cart(),
    categorySelectors: $("#categorySelectors"),
    categoryItem: $("[data-category]"),
    checkOutButton: $("#checkOut"),
    total:$('.total'),
    updateTotal: function(){
      env.total.text(`total: $${env.cart.total}`);
    },
    newCartItem: function(event){
      let target = event.target;
      let $target = $(target);

      // if no items are in shopping cart
      // or if the li was clicked and not its children
      // then break out of the function
      if(!env.cart.shoppingList.length || $target.is('tr') ){ return; }

      // get the parent of this shopping cart list item
      let $parent = $target.parents('.cart-item');
      let itemName = $parent.attr("data-name");
      let item = env.cart.getItem(itemName);

      switch(target.nodeName){
        case 'INPUT':
          let newQuantity = parseInt($target.val());

          // no change in quantity
          if( newQuantity === env.cart.tracker[ itemName ].quantity ){ return; }

          // IF QUANTITY IS BELOW 0
          if(newQuantity <= 0){
            console.log("zero items");
            env.cart.removeItem(itemName);

          } else {

            env.cart.updateQuantity( itemName, newQuantity );
            $("[data-name='" + itemName +"']").find("input[type='number']").val(newQuantity);

          }

          break;
        case 'I':
          // add to cart button
          env.cart.removeItem(itemName);
          break;
      }

      env.updateTotal();

    }
  };



  /*
   * EVENT LISTENERS
  */

  env.content.on("click",".item-button",function(event){
    // WHEN ADD TO CART BUTTON IS PRESSED
    var $me = $(this);

    $me.toggleShortcut();

    var $content = $me.parents('.content-item');
    var contentItem = new Item($content);

    env.cart.addToCart(contentItem);
    env.updateTotal();
  });



  env.shoppingCart.on("click", env.newCartItem);
  env.content.on("click",".shortcut-cart",function(event){
    env.newCartItem(event);
  })


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
      env.shoppingCart.parents("section").hide();

    }


  });

  env.checkOutButton.on("click",function(event){
    let $this = $(this);
    if( $this.is(":disabled") ){ return; }

    env.shoppingCart.parents("section").show();
    env.content.hide();

  });

// }); // end to jQuery ready shortcut function
