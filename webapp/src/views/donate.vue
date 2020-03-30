<template>
  <div class="container">
    <div class="row">
      <!-- <form>
        <div class="form-group">
          <label for="donorPhone">Phone</label>
          <input id="donorPhone" class="form-control" type="tel">
        </div>
        <div class="form-group">
          <label for="donorEmail">Email</label>
          <input id="donorEmail" class="form-control" type="email">
        </div>
        <div class="form-group">
          <label for="donorPassword">Password</label>
          <input id="donorPassword" class="form-control" type="password">
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
      </form> -->
      <div class="col-md-8">
        <h2>Donate</h2>
        <form>
          <div class="form-group">
            <label for="donateAmount">Amount</label>
            <input id="donateAmount" type="number" class="form-control">
          </div>
          <button type="submit" class="btn btn-primary">Donate</button>
        </form>
        <hr>
        <h3>Nominated beneficiaries</h3>
        <p>You can nominate up to x beneficiaries to the system</p>
        <h3>Appoint trusted point person</h3>
        <p>You can appoint a trusted point person and they can nominate
          beneficiaries on your behalf</p>
      </div>
      <div class="col-md-4">
        <h3>My Stats</h3>
        <div>
          <b>Account balance</b>: 10000
        </div>
        <div>
          <b>Amount donated</b>: 5000
        </div>
        <div>
          <b>People donated to</b>: 5
        </div>
        <h3>Donation history</h3>
      </div>
    </div>
  </div>
</template>
