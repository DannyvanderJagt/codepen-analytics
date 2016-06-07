let Validater = {
  codepen(req) {
    let referer = req.headers.referer

    if (!referer) {
      return false
    }

    let parts = referer.split('http://s.codepen.io')

    console.log('{validate}', referer, parts)
    return true
  }

}

export default Validater
