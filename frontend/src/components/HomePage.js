import { Button, Form, Card } from 'react-bootstrap'
import React, { useState, useEffect } from 'react'
import Idea from './Idea'
import MyNavbar from './MyNavbar'
import axios from 'axios'
import ideaService from '../services/ideas'
import Notification from './Notification'

const HomePage = () => {
  /* User state */
  const [userID, setUserID] = useState()
  const [ideas, setIdeas] = useState([])
  const [errorMessage, setErrorMessage] = useState(null)
  const [search, setSearch] = useState('')

  /* Idea fields states */
  const [title, setTitle] = useState('')
  const [domain, setDomain] = useState('')
  const [stateOfTheArt, setStateOfTheArt] = useState('')
  const [solution, setSolution] = useState('')
  const [category, setCategory] = useState('')
  const [author, setAuthor] = useState('')
  const [visible, setVisible] = useState(false)

  /* All state on change handlers */
  const handleTitleOnChange = (event) => setTitle(event.target.value)
  const handleDomainOnChange = (event) => setDomain(event.target.value)
  const handleStateOfTheArtOnChange = (event) =>
    setStateOfTheArt(event.target.value)
  const handleSolutionOnChange = (event) => setSolution(event.target.value)
  const handleCategoryChange = (event) => setCategory(event.target.value)

  /** OnChange listener */
  const onChangeSearch = (event) => {
    console.log(event.target.value)
    setSearch(event.target.value)
  }

  // CSS styling
  const createIdeaFormStyle = {
    display: visible ? '' : 'none',
  }

  /* This function checks if the user is already logged in. */
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedInUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setAuthor(`${user.firstName} ${user.lastName}`)
      setVisible(true)
      console.log('front/component/HomePage.js: logged in user found', user)

      /* get user's ID */
      const getInfo = { email: user.email }
      axios
        .post('http://localhost:3001/api/users/getUser', getInfo)
        .then((request) => {
          console.log(request.data.id)
          setUserID(request.data.id)
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [])

  /* This function gets all ideas */
  useEffect(() => {
    ideaService.getAll().then((ideas) => {
      setIdeas(ideas)
      console.log('ideas: ', ideas)
    })
  }, [])

  /* This function handles create idea form upon submit. */
  const handleCreateIdea = async (event) => {
    event.preventDefault()

    if (
      title === '' ||
      domain === '' ||
      stateOfTheArt === '' ||
      solution === ''
    ) {
      /* error message appears for 5s, then disappears */
      setErrorMessage('Oh no, fields cannot be empty! Please try again.')
      console.log('aaaaaa')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)

      return
    }

    const user = userID

    const problemStatement = {
      domain: domain,
      stateOfTheArt: stateOfTheArt,
      solution: solution,
    }

    try {
      const idea = await ideaService.create({
        title,
        problemStatement,
        upVote: 0,
        downVote: 0,
        author,
        user,
        category,
      })

      /* add new idea to array */
      setIdeas(ideas.concat(idea))

      /* Empty form */
      document.getElementById('create-idea-form').reset()
    } catch (exception) {
      console.log('HomePage: fail to create idea')

      /* error message appears for 5s, then disappears */
      setErrorMessage('Error! Fail to create idea.')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  /* This function handles search button,
  make sure ideas is not altered */
  const handleSearchSubmit = async (event) => {
    event.preventDefault()
    console.log('Search btn clicked.')

    let copy
    await ideaService.getAll().then((ideas) => {
      copy = ideas
    })

    const ideasByKeywords = copy.filter(filterByTitle)

    setIdeas(ideasByKeywords)
  }

  const filterByTitle = (idea) => {
    return idea.title.toLowerCase().indexOf(search) !== -1
  }

  /* Dropdown sort by most popularity */
  const handleSortMostPopularity = async (event) => {
    console.log('Popularity dropdown clicked')
    let copy
    await ideaService.getAll().then((ideas) => {
      copy = ideas
    })

    copy.sort(function (a, b) {
      const bVote = b.upVote - b.downVote
      const aVote = a.upVote - a.downVote
      return bVote - aVote
    })

    setIdeas(copy)
  }

  /** Dropdown sort by most recent */
  const handleSortMostRecent = async (event) => {
    console.log('Most Recent dropdown clicked')
    let copy
    await ideaService.getAll().then((ideas) => {
      copy = ideas
    })

    copy.sort((a, b) => new Date(b.date) - new Date(a.date))
    setIdeas(copy)
  }

  return (
    <div>
      {/* ============= MyNavbar ============= */}
      <MyNavbar
        handleSearchSubmit={handleSearchSubmit}
        onChangeSearch={onChangeSearch}
        handleSortMostPopularity={handleSortMostPopularity}
        handleSortMostRecent={handleSortMostRecent}
        onHomePage={true}
      />
      <div className='d-flex justify-content-between mt-4 pt-4 pl-5 ml-5 pr-4'>
        <div className='p-2 ml-5 pr-5 mr-5 w-75'>
          {/* ============= CREATE NEW IDEA ============= */}

          <Form
            id='create-idea-form'
            className='border mt-4 p-3 w-100 border-info'
            onSubmit={handleCreateIdea}
            style={createIdeaFormStyle}>
            {/* ===== TITLE ===== */}
            <Notification message={errorMessage} />
            <Form.Group controlId='title'>
              <Form.Label>Title</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter the title of your idea'
                onChange={handleTitleOnChange}
              />
            </Form.Group>

            {/* ===== DOMAIN ===== */}
            <Form.Group controlId='domain'>
              <Form.Label>Problem Domain</Form.Label>
              <Form.Control
                as='textarea'
                placeholder='Enter the domain of your idea'
                onChange={handleDomainOnChange}
              />
            </Form.Group>

            {/* ===== STATE OF THE ART ===== */}
            <Form.Group controlId='stateOfTheArt'>
              <Form.Label>State of the Art</Form.Label>
              <Form.Control
                as='textarea'
                placeholder='Enter the state of the art'
                onChange={handleStateOfTheArtOnChange}
              />
            </Form.Group>

            {/* ===== SOLUTION ===== */}
            <Form.Group controlId='solution'>
              <Form.Label>Solution</Form.Label>
              <Form.Control
                as='textarea'
                placeholder='Enter the solution'
                onChange={handleSolutionOnChange}
              />
            </Form.Group>
            {/* ===== CATEGORY ===== */
            /*cooking, space, art, educational, programming, science, boutonniere, fashion, business, technology, health, music, gaming, entertainment*/}

            <Form.Group controlID='category'>
              <Form.Label>Category</Form.Label>
              <Form.Control
                as='select'
                defaultValue='Other'
                onChange={handleCategoryChange}>
                <option value='Cooking'>Cooking</option>
                <option value='Space'>Space</option>
                <option value='Art'>Art</option>
                <option value='Educational'>Educational</option>
                <option value='Programming'>Programming</option>
                <option value='Science'>Science</option>
                <option value='Boutonniere'>Boutonniere</option>
                <option value='Fashion'>Fashion</option>
                <option value='Business'>Business</option>
                <option value='Technology'>Technology</option>
                <option value='Health'>Health</option>
                <option value='Music'>Music</option>
                <option value='Gaming'>Gaming</option>
                <option value='Other'>Other</option>
              </Form.Control>
            </Form.Group>

            {/* ===== BUTTON ===== */}
            <Button variant='info' type='submit'>
              Post Your Idea
            </Button>
          </Form>

          {/* ============= DISPLAY ALL IDEAS ============= */}
          <div className='w-100'>
            {ideas.map((idea, i) => (
              <Idea key={i} idea={idea} />
            ))}
          </div>
        </div>

        <div className='w-25 mt-4 p-2 pr-2'>
          {/* ============= SIDE TEXT ============= */}
          <Card bg='info' text='light' className='p-2'>
            <Card.Body>
              <Card.Header>IdeaPlaza Statement</Card.Header>
              <br></br>
              <Card.Title>The Importance of Ideas</Card.Title>
              <Card.Text>
                The modern world is powered by ideas. Without ideas, change does
                not happen and no human progress is possible. The good thing is
                that humans are inherently creators of ideas, but the bad thing
                is that not all ideas get shared.
              </Card.Text>
              <br></br>
              <Card.Title>The Goal of IdeaPlaza</Card.Title>

              <Card.Text>
                The goal of IdeaPlaza is to bring great ideas together and make
                them a reality with constructive criticism. Ultimately, in the
                hope that with many more great ideas generated throughout the
                world, many major issues will be solved and the world will
                become a happier and healthier place.
              </Card.Text>
              <br></br>
              <Card.Title>What Makes IdeaPlaza Stood Out?</Card.Title>
              <Card.Text>
                IdeaPlaza avoids the current state of the art polarization by
                having a feature specifically for developers to offer
                constructive criticism, as well as a voting system on projects
                but not on comments.
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default HomePage
