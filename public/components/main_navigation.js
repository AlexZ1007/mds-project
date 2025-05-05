
const navbarTemplate = document.createElement('template');

navabrTemplate.innerHTML = `
    <style>
        @import "https://cdn.tailwindcss.com";
    </style>
    <nav class="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 shadow-lg h-16 px-6 flex justify-between items-stretch">
        <a href="/home.html" class="text-3xl font-bold text-yellow-300 hover:text-yellow-400 transition flex items-center" style="font-family: 'Cinzel', serif;">
        Arcana
        </a>
  
    <div class="flex items-stretch space-x-4">
      <!-- Full-height Button -->
      <a href="/home.html" class="text-yellow-300 px-6 flex items-center font-bold hover:bg-purple-600 transition" style="font-family: 'Cinzel', serif;">
        HOME
      </a>
      <a href="/collection.html" class="text-yellow-300 px-6 flex items-center font-bold hover:bg-purple-600 transition" style="font-family: 'Cinzel', serif;">
        COLLECTION
      </a>
      <a href="/shop.html" class="text-yellow-300 px-6 flex items-center font-bold hover:bg-purple-600 transition" style="font-family: 'Cinzel', serif;">
        SHOP
      </a>
  
      <!-- Dropdown -->
      <div x-data="{ open: false }" class="relative flex items-center">
        <button @click="open = !open" class="text-yellow-100 font-semibold hover:text-yellow-300 focus:outline-none h-full px-4 flex items-center">
          John Doe
          <svg class="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        <div
          x-show="open"
          @click.away="open = false"
          class="absolute right-0 mt-16 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50"
        >
          <a href="/profile.html" class="block px-4 py-2 text-gray-700 hover:bg-gray-100">View Profile</a>
          <a href="/logout.html" class="block px-4 py-2 text-red-500 hover:bg-red-50">Logout</a>
        </div>
      </div>
    </div>
  </nav>
`;

class Navbar extends HTMLElement {
  constructor() {
    super();
    // this.attachShadow({ mode: 'open' });
    this.appendChild(navbarTemplate.content.cloneNode(true));
  }
}


customElements.define('navbar', Navbar);

