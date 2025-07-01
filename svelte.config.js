import adapter from '@sveltejs/adapter-static';

const repo = 'myz_character_sheet';              // <= your repo folder on GH Pages

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			fallback: '404.html'
		}),
		paths: {
			base: `/${repo}`                  // no dev/prod switch
		},
		prerender: { entries: ['*'] } 
	}
};

export default config;