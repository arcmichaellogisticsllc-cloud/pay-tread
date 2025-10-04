@props(['url' => config('app.url')])

<table class="header" width="100%" cellpadding="0" cellspacing="0" role="presentation">
  <tr>
    <td class="content-cell" align="center" style="padding: 28px 0;">
      <a href="{{ $url }}" style="display:inline-block;text-decoration:none;">
        <img src="{{ asset('images/paytread-logo.png') }}"
             alt="PayTread"
             class="logo"
             width="160"
             style="height:auto;border:none;display:block;">
      </a>
    </td>
  </tr>
</table>
