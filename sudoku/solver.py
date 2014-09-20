# Sudoku solver
# following: http://norvig.com/sudoku.html
# 

# . . . | . . . | . . .
# . . . | . . . | . . .
# . . . | . . . | . . .
# ------+-------+------
# . . . | . . . | . . .
# . . . | . . . | . . .
# . . . | . . . | . . .
# ------+-------+------
# . . . | . . . | . . .
# . . . | . . . | . . .
# . . . | . . . | . . .
# 

# rows: A - I
# cols: 1 - 9
# 
# square: on square containg a number or blank
# unit: collection of 9 squares (row, col or box)
# peers: squares that share a unit

# A puzzle
# 81 squares
# 27 units
# all squares should belong to 3 units
# all squares should have 20 peers 
#   a square belong to 3 units which gives 3 * 8 (excluding itself) => 24
#   removing the peers which appears twice (both box and row/col): 24 - 4 => 20





def cross(A, B):
  "Cross product of elements in A and B"
  return [a+b for a in A for b in B]


digits = "123456789"

rows = "ABCDEFGHI"
cols = digits
squares = cross(rows, cols)
unitlist = ([cross(rows, c) for c in cols] +
            [cross(r, cols) for r in rows] +
            [cross(rs, cs) for rs in ("ABC", "DEF", "GHI") for cs in ("123", "456", "789")])
units = dict((s, [u for u in unitlist if s in u]) for s in squares)
peers = dict((s, set(sum(units[s], [])) - set([s])) for s in squares)




"""
. . . | . . . | . . .
. . . | . . . | . . .
. . . | . . . | . . .
------+-------+------
. . . | . . . | . . .
. . . | . . . | . . .
. . . | . . . | . . .
------+-------+------
. . . | . . . | . . .
. . . | . . . | . . .
. . . | . . . | . . .
"""


def parse_grid(grid):
  """
  Convert a textual representation of a sudoku puzzle(grid) to a dict of possible values, {square: digits}, or
  return False if contradiction is detected.
  """
  values = dict((s, digits) for s in squares)
  for s, d in grid_values(grid).items():
    if d in digits and not assign(values, s, d):
      return False ## (Fail if we can't assign d to square s)
  return values

def grid_values(grid):
  """
  Convert textual representation of a grid into a dict of {square: char} with '0' or '.' for blanks.
  """
  chars = [c for c in grid if c in digits or c in '.0']
  assert(len(chars) == 81)
  return dict(zip(squares, chars))



def assign(values, s, d):
  """
  Eliminate all other values than d from values[s] and propagate.
  Return values or False if a contradiction is detected.
  """
  other_values = values[s].replace(d, '')
  if all(eliminate(values, s, d2) for d2 in other_values):
    return values
  else:
    return False


def eliminate(values, s, d):
  """
  Eliminate d as a possibility from values[s]; propagate when values or places <= 2.
  Return values or False if  contradiction is detected.  
  """
  if d not in values[s]:
    return values ## Already eliminated
  values[s] = values[s].replace(d, '')
  ## (1) If square [s] is reduced to one value [d2] then eliminate d2 from peers of s
  if len(values[s]) == 0:
    return False ## Contradiction: removed last value
  elif len(values[s]) == 1:
    d2 = values[s]
    if not all(eliminate(values, s2, d2) for s2 in peers[s]):
      return False
  ## (2) If a unit is reduced to only one place for value d, then put it there
  for u in units[s]:
    dplaces = [s for s in u if d in values[s]]
    if len(dplaces) == 0:
      return False ## Contradiction: no place for value d
    elif len(dplaces) == 1:
      # d can only be in one place, put it there
      if not assign(values, dplaces[0], d):
        return False
  return values
  



grids = [
"""
003020600
900305001
001806400
008102900
700000008
006708200
002609500
800203009
005010300
""",
"""
4 . . | . . . | 8 . 5
. 3 . | . . . | . . .
. . . | 7 . . | . . .
------+-------+------
. 2 . | . . . | . 6 .
. . . | . 8 . | 4 . .
. . . | . 1 . | . . .
------+-------+------
. . . | 6 . 3 | . 7 .
5 . . | 2 . . | . . .
1 . 4 | . . . | . . .
"""
]


def display(values):
  """
  Display values as a 2D grid.
  """
  width = 1+max(len(values[s]) for s in squares)
  line = '+'.join(['-' * (width * 3)] * 3)
  for r in rows:
    print(''.join(values[r+c].center(width) + ('|' if c in '36' else '') for c in cols))
    if r in 'CF':
      print(line)



def test_definitions():
  "Test definitions"
  assert(len(squares) == 81)
  assert(len(unitlist) == 27)
  assert(len(unit[s] == 3) for s in squares)
  assert(len(peers[s] == 20) for s in squares)
  assert units['C2'] == [['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2', 'I2'],
                         ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'],
                         ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3']]
  assert peers['C2'] == set(['A2', 'B2', 'D2', 'E2', 'F2', 'G2', 'H2', 'I2',
                             'C1', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9',
                             'A1', 'A3', 'B1', 'B3'])
  print("All tests pass")



test_definitions()

display(parse_grid(grids[1]))
